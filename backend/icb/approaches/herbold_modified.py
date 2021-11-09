import sys
import os
import threading
import re
from copy import deepcopy

import numpy as np
import pandas

from sklearn.base import BaseEstimator
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.model_selection import KFold
from sklearn.pipeline import Pipeline
from sklearn.metrics import f1_score
from skift import ColLblBasedFtClassifier
from skift.util import temp_dataset_fpath, dump_xy_to_fasttext_format

from backend.icb.utils import remove_new_lines


def subset_npe(X):
    matches = []
    for index, row in X.iterrows():
        match = False
        for word in re.split(r'\W', row.description):
            match |= word.lower() in ['npe', 'nullpointer', 'nullpointerexception']
            if match:
                break
        matches.append(match)
    matches = np.array([x for x in matches])
    return matches


def cv_autotune_fasttext_fit(X, y, *, input_col_lbl, cv_folds, autotuneDuration=300):
    """
    Helper method to train fastText with autotuning through cross valdiation. This is not yet supported by the API.
    :param X: features
    :param y: labels
    :param input_col_lbl: input column that is used from features
    :param cv_folds: number of cv folds
    :param autotuneDuration: duration of the autotune (Default: 300)
    :return: fitted autotuned fastText classifier
    """
    train_test_folds = []
    cv_clfs = []
    cv_args = []
    folds = KFold(n_splits=cv_folds, shuffle=True)
    for train_index, test_index in folds.split(X, y):
        train_test_folds.append((train_index, test_index))
        tmp_file = temp_dataset_fpath()
        dump_xy_to_fasttext_format(X.iloc[test_index], y.iloc[test_index], tmp_file)

        # redirect stdout from C++ code into variable, we get the hyper parameters from there
        stdout_fileno = sys.stdout.fileno()
        stdout_save = os.dup(stdout_fileno)
        stdout_pipe = os.pipe()
        os.dup2(stdout_pipe[1], stdout_fileno)
        os.close(stdout_pipe[1])
        captured_stdout = b''

        # use a thread to drain the pipe to avoid a potential deadlock
        def drain_pipe():
            nonlocal captured_stdout
            while True:
                data = os.read(stdout_pipe[0], 1024)
                if not data:
                    break
                captured_stdout += data
        t = threading.Thread(target=drain_pipe)
        t.start()

        # we use the skift-wrapper for the fasttext api
        # training must be with verbose>2 to trigger the output of the hyper parameters
        cv_clf = ColLblBasedFtClassifier(input_col_lbl=input_col_lbl, autotuneValidationFile=tmp_file, verbose=3,
                                         autotuneDuration=autotuneDuration)
        cv_clf.fit(X, y)

        # stop redirection of stdout and close pipe
        os.close(stdout_fileno)
        t.join()
        os.close(stdout_pipe[0])
        os.dup2(stdout_save, stdout_fileno)
        os.close(stdout_save)

        # parse best params from output stream and prepare them as kwargs-dict
        captured_out = captured_stdout.decode(sys.stdout.encoding)
        cur_cv_args = {}
        for bestarg in captured_out.split('Best selected args')[-1].strip().split('\n')[1:]:
            arg = bestarg.split('=')[0].strip()
            val = bestarg.split('=')[-1].strip()
            if arg not in 'dsub':
                try:
                    cur_cv_args[arg] = int(val)
                except ValueError:
                    try:
                        cur_cv_args[arg] = float(val)
                    except ValueError:
                        cur_cv_args[arg] = val

        # cleanup validation file
        try:
            os.remove(tmp_file)
        except FileNotFoundError:
            pass

        cv_clfs.append(cv_clf)
        cv_args.append(cur_cv_args)

    best_args = None
    best_score = None
    for i, (train_index, test_index) in enumerate(train_test_folds):
        y_pred = np.around(cv_clfs[i].predict_proba(X.iloc[test_index])[:, 1], decimals=0)
        cur_score = f1_score(y.iloc[test_index], y_pred)
        if best_score is None or best_score < cur_score:
            best_args = cv_args[i]
            best_score = cur_score
    print('Best args of cv-autotune: %s' % best_args)
    # fit classifier with best arguments on all data
    clf = ColLblBasedFtClassifier(input_col_lbl=input_col_lbl, **best_args)
    clf.fit(X, y)
    return clf


class Herbold2020_FastText_AutoTuned(BaseEstimator):
    """
    FastText with 90 seconds autotuning and rules
    """

    def __init__(self, title_description_ratio=0.5):
        self.title_description_ratio = title_description_ratio
        self.threshold = 0.5
        self.cv_folds = 3
        self.autotune_duration = 90
        self.text_clf = None
        self.title_clf = None
        self.npe_text_clf = None
        self.npe_title_clf = None

    def fit(self, X, y):
        matches_npe = subset_npe(X)

        self.text_clf = cv_autotune_fasttext_fit(X[~matches_npe], y[~matches_npe], input_col_lbl='description',
                                                 cv_folds=self.cv_folds, autotuneDuration=self.autotune_duration)
        self.title_clf = cv_autotune_fasttext_fit(X[~matches_npe], y[~matches_npe], input_col_lbl='title',
                                                  cv_folds=self.cv_folds, autotuneDuration=self.autotune_duration)
        self.npe_text_clf = cv_autotune_fasttext_fit(X[matches_npe], y[matches_npe], input_col_lbl='description',
                                                     cv_folds=self.cv_folds, autotuneDuration=self.autotune_duration)
        self.npe_title_clf = cv_autotune_fasttext_fit(X[matches_npe], y[matches_npe], input_col_lbl='title',
                                                      cv_folds=self.cv_folds, autotuneDuration=self.autotune_duration)

        return self

    def predict(self, X):
        y_pred_proba = self.predict_proba(X)
        y_pred = (y_pred_proba[:, 1] > self.threshold).astype(int)
        return y_pred

    def predict_proba(self, X):
        y_pred_text = self.text_clf.predict_proba(X)
        y_pred_title = self.title_clf.predict_proba(X)
        y_pred_npe_text = self.npe_text_clf.predict_proba(X)
        y_pred_npe_title = self.npe_title_clf.predict_proba(X)
        matches_npe = subset_npe(X)
        y_pred = self.title_description_ratio*y_pred_text+(1-self.title_description_ratio)*y_pred_title
        y_pred[matches_npe] = self.title_description_ratio * y_pred_npe_text[matches_npe] + \
                              (1 - self.title_description_ratio) * y_pred_npe_title[matches_npe]
        return y_pred

    def filter(self, df):
        df['title'] = df['title'].map(lambda x: remove_new_lines(x))
        df['description'] = df['description'].map(lambda x: remove_new_lines(x))
        return df[['title', 'description']]

# single components for performance analysis
class Herbold2020_Description(BaseEstimator):
    """
    FastText with 90 seconds autotuning and rules
    """

    def __init__(self, title_description_ratio=0.5):
        self.title_description_ratio = title_description_ratio
        self.threshold = 0.5
        self.cv_folds = 3
        self.autotune_duration = 90
        self.text_clf = None
        self.title_clf = None
        self.npe_text_clf = None
        self.npe_title_clf = None

    def fit(self, X, y):
        self.text_clf = cv_autotune_fasttext_fit(X, y, input_col_lbl='description',
                                                 cv_folds=self.cv_folds, autotuneDuration=self.autotune_duration)

        return self

    def predict(self, X):
        y_pred_proba = self.predict_proba(X)
        y_pred = (y_pred_proba[:, 1] > self.threshold).astype(int)
        return y_pred

    def predict_proba(self, X):
        return self.text_clf.predict_proba(X)

    def filter(self, df):
        df['title'] = df['title'].map(lambda x: remove_new_lines(x))
        df['description'] = df['description'].map(lambda x: remove_new_lines(x))
        return df[['title', 'description']]

class Herbold2020_Title(BaseEstimator):
    """
    FastText with 90 seconds autotuning and rules
    """

    def __init__(self, title_description_ratio=0.5):
        self.title_description_ratio = title_description_ratio
        self.threshold = 0.5
        self.cv_folds = 3
        self.autotune_duration = 90
        self.text_clf = None
        self.title_clf = None
        self.npe_text_clf = None
        self.npe_title_clf = None

    def fit(self, X, y):
        self.title_clf = cv_autotune_fasttext_fit(X, y, input_col_lbl='title',
                                                 cv_folds=self.cv_folds, autotuneDuration=self.autotune_duration)

        return self

    def predict(self, X):
        y_pred_proba = self.predict_proba(X)
        y_pred = (y_pred_proba[:, 1] > self.threshold).astype(int)
        return y_pred

    def predict_proba(self, X):
        return self.title_clf.predict_proba(X)

    def filter(self, df):
        df['title'] = df['title'].map(lambda x: remove_new_lines(x))
        df['description'] = df['description'].map(lambda x: remove_new_lines(x))
        return df[['title', 'description']]


# Other variants we tried
class Herbold2020_NoRules_FastText_AutoTuned(BaseEstimator):
    """
    FastText with 90 seconds autotuning and without rules for NPEs
    """

    def __init__(self, title_description_ratio=0.5):
        self.title_description_ratio = title_description_ratio
        self.threshold = 0.5
        self.cv_folds = 3
        self.autotune_duration = 30
        self.text_clf = None
        self.title_clf = None

    def fit(self, X, y):
        self.text_clf = cv_autotune_fasttext_fit(X, y, input_col_lbl='description', cv_folds=self.cv_folds,
                                                 autotuneDuration=self.autotune_duration)
        self.title_clf = cv_autotune_fasttext_fit(X, y, input_col_lbl='title', cv_folds=self.cv_folds,
                                                  autotuneDuration=self.autotune_duration)
        return self

    def predict(self, X):
        y_pred_proba = self.predict_proba(X)
        y_pred = (y_pred_proba[:, 1] > self.threshold).astype(int)
        return y_pred

    def predict_proba(self, X):
        y_pred_text = self.text_clf.predict_proba(X)
        y_pred_title = self.title_clf.predict_proba(X)
        y_pred = self.title_description_ratio*y_pred_text+(1-self.title_description_ratio)*y_pred_title
        return y_pred

    def filter(self, df):
        df['title'] = df['title'].map(lambda x: remove_new_lines(x))
        df['description'] = df['description'].map(lambda x: remove_new_lines(x))
        return df[['title', 'description']]


class Herbold2020_FastText_Modified(BaseEstimator):
    """
    FastText with rules
    """

    def __init__(self, title_description_ratio=0.5):
        self.title_description_ratio = title_description_ratio
        self.threshold = 0.5
        self.text_clf = None
        self.title_clf = None
        self.npe_text_clf = None
        self.npe_title_clf = None

    def fit(self, X, y):
        matches_npe = subset_npe(X)

        self.text_clf = ColLblBasedFtClassifier(input_col_lbl='description', wordNgrams=1, minCount=14)
        #self.title_clf = ColLblBasedFtClassifier(input_col_lbl='title', wordNgrams=1, minCount=14)
        self.npe_text_clf = ColLblBasedFtClassifier(input_col_lbl='description', wordNgrams=1, minCount=14)
        #self.npe_title_clf = ColLblBasedFtClassifier(input_col_lbl='title', wordNgrams=1, minCount=14)

        self.text_clf.fit(X[~matches_npe], y[~matches_npe])
        #self.title_clf.fit(X[~matches_npe], y[~matches_npe])
        self.npe_text_clf.fit(X[matches_npe], y[matches_npe])
        #self.npe_title_clf.fit(X[matches_npe], y[matches_npe])

        return self

    def predict(self, X):
        y_pred_proba = self.predict_proba(X)
        y_pred = (y_pred_proba[:, 1] > self.threshold).astype(int)
        return y_pred

    def predict_proba(self, X):
        print(X)
        y_pred_text = self.text_clf.predict_proba(X)
        #y_pred_title = self.title_clf.predict_proba(X)
        y_pred_npe_text = self.npe_text_clf.predict_proba(X)
        #y_pred_npe_title = self.npe_title_clf.predict_proba(X)
        matches_npe = subset_npe(X)
        y_pred = y_pred_text
        y_pred[matches_npe] = y_pred_npe_text[matches_npe]
        return y_pred

    def predict_proba_plain(self, X):
        # print(X)
        print(type(X))
        X_df = pandas.DataFrame(X, columns=["description"])
        return self.predict_proba(X_df)

    def predict_proba_plainText(self, X):
        X_df = pandas.DataFrame([[X]], columns=["description"])
        return self.predict_proba(X_df)



    def filter(self, df):
        df['title'] = df['title'].map(lambda x: remove_new_lines(x))
        df['description'] = df['description'].map(lambda x: remove_new_lines(x))
        return df['description'].to_frame()


class Herbold2020_NoRules_FastText(BaseEstimator):
    """
    FastText without rules
    """

    def __init__(self, title_description_ratio=0.5):
        self.title_description_ratio = title_description_ratio
        self.threshold = 0.5
        self.text_clf = None
        self.title_clf = None

    def fit(self, X, y):
        self.text_clf = ColLblBasedFtClassifier(input_col_lbl='description', wordNgrams=1, minCount=14)
        self.title_clf = ColLblBasedFtClassifier(input_col_lbl='title', wordNgrams=1, minCount=14)

        self.text_clf.fit(X, y)
        self.title_clf.fit(X, y)

        return self

    def predict(self, X):
        y_pred_proba = self.predict_proba(X)
        y_pred = (y_pred_proba[:, 1] > self.threshold).astype(int)
        return y_pred

    def predict_proba(self, X):
        y_pred_text = self.text_clf.predict_proba(X)
        y_pred_title = self.title_clf.predict_proba(X)
        y_pred = self.title_description_ratio * y_pred_text + (1 - self.title_description_ratio) * y_pred_title
        return y_pred

    def filter(self, df):
        df['title'] = df['title'].map(lambda x: remove_new_lines(x))
        df['description'] = df['description'].map(lambda x: remove_new_lines(x))
        return df[['title', 'description']]


class Herbold2020(BaseEstimator):
    """
    Base variant for any sklearn classifier without any tuning with rules
    """

    def __init__(self, clf, title_description_ratio=0.5):
        """
        :param clf: We used the RandomForestClassifier and MultinomialNB classifier
        """
        self.clf = clf
        self.title_description_ratio = title_description_ratio
        self.threshold = 0.5
        self.text_clf = None
        self.title_clf = None
        self.npe_text_clf = None
        self.npe_title_clf = None

    def fit(self, X, y):
        clf = Pipeline([('vect', CountVectorizer()),
                        ('tfidf', TfidfTransformer()),
                        ('clf', self.clf), ])

        self.text_clf = deepcopy(clf)
        self.title_clf = deepcopy(clf)
        self.npe_text_clf = deepcopy(clf)
        self.npe_title_clf = deepcopy(clf)

        matches_npe = subset_npe(X)

        # train different classifiers depending whether the text contains NPE or not
        self.text_clf.fit(X[~matches_npe].description, y[~matches_npe])
        self.title_clf.fit(X[~matches_npe].title, y[~matches_npe])
        self.npe_text_clf.fit(X[matches_npe].description, y[matches_npe])
        self.npe_title_clf.fit(X[matches_npe].description, y[matches_npe])

        return self

    def predict(self, X, y=None):
        y_pred_proba = self.predict_proba(X, y)
        y_pred = (y_pred_proba[:, 1] > self.threshold).astype(int)
        return y_pred

    def predict_proba(self, X, y=None):
        y_pred_text = self.text_clf.predict_proba(X.description)
        y_pred_title = self.title_clf.predict_proba(X.title)
        y_pred_npe_text = self.npe_text_clf.predict_proba(X.description)
        y_pred_npe_title = self.npe_title_clf.predict_proba(X.title)
        matches_npe = subset_npe(X)
        y_pred = self.title_description_ratio*y_pred_text+(1-self.title_description_ratio)*y_pred_title
        y_pred[matches_npe] = self.title_description_ratio * y_pred_npe_text[matches_npe] + \
                              (1 - self.title_description_ratio) * y_pred_npe_title[matches_npe]
        return y_pred

    def filter(self, df):
        return df[['title', 'description']]


class Herbold2020_NoRules(BaseEstimator):
    """
    Base variant for any sklearn classifier without any tuning and no rules
    """

    def __init__(self, clf, title_description_ratio=0.5):
        """
        :param clf: We used the RandomForestClassifier and MultinomialNB classifier
        """
        self.clf = clf
        self.title_description_ratio = title_description_ratio
        self.threshold = 0.5
        self.text_clf = None
        self.title_clf = None

    def fit(self, X, y):
        clf = Pipeline([('vect', CountVectorizer()),
                        ('tfidf', TfidfTransformer()),
                        ('clf', self.clf), ])

        self.text_clf = deepcopy(clf)
        self.title_clf = deepcopy(clf)

        # train different classifiers depending whether the text contains NPE or not
        self.text_clf.fit(X.description, y)
        self.title_clf.fit(X.title, y)

        return self

    def predict(self, X, y=None):
        y_pred_proba = self.predict_proba(X, y)
        y_pred = (y_pred_proba[:, 1] > self.threshold).astype(int)
        return y_pred

    def predict_proba(self, X, y=None):
        y_pred_text = self.text_clf.predict_proba(X.description)
        y_pred_title = self.title_clf.predict_proba(X.title)
        y_pred = self.title_description_ratio*y_pred_text+(1-self.title_description_ratio)*y_pred_title
        return y_pred

    def filter(self, df):
        return df[['title', 'description']]


class Herbold2020_Basic(BaseEstimator):
    """
    Base variant for any sklearn classifier without any tuning and no rules
    """

    def __init__(self, clf, title_description_ratio=0.5):
        """
        :param clf: We used the RandomForestClassifier and MultinomialNB classifier
        """
        self.clf = clf
        self.title_description_ratio = title_description_ratio
        self.threshold = 0.5
        self.combined_clf = None

    def fit(self, X, y):
        clf = Pipeline([('vect', CountVectorizer()),
                        ('tfidf', TfidfTransformer()),
                        ('clf', self.clf), ])

        self.combined_clf = deepcopy(clf)

        # train different classifiers depending whether the text contains NPE or not
        self.combined_clf.fit(X.combined, y)

        return self

    def predict(self, X, y=None):
        y_pred_proba = self.predict_proba(X, y)
        y_pred = (y_pred_proba[:, 1] > self.threshold).astype(int)
        return y_pred

    def predict_proba(self, X, y=None):
        return self.combined_clf.predict_proba(X.combined)

    def filter(self, df):
        df['combined'] = df['title'] + " " + df['description']
        return df[['combined']]

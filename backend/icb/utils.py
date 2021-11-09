import re

from nltk import PorterStemmer
from nltk.corpus import stopwords
from pycoshark.mongomodels import IssueComment
import pandas as pd
import unicodedata
import sys

from sklearn.base import TransformerMixin
from sklearn.feature_extraction.text import CountVectorizer

tbl = dict.fromkeys(i for i in range(sys.maxunicode) if unicodedata.category(chr(i)).startswith('P'))
clean_regex = re.compile('<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});')
stop_words = set(stopwords.words('english'))


class StemmingStopWordRemovalCountTokenizer(CountVectorizer):
    def build_tokenizer(self):
        tokenize = super().build_tokenizer()
        return lambda doc: list(porter_stemming(remove_stopwords(tokenize(doc))))


class DenseTransformer(TransformerMixin):

    def fit(self, X, y=None, **fit_params):
        return self

    def transform(self, X, y=None, **fit_params):
        return X.todense()


def create_data_frame_for_issue_data(issues):
    # Title, description, discussion
    data = []
    for issue in issues:
        features = [issue.id, issue.title, issue.desc]
        comment_string = ""
        for comment in IssueComment.objects.filter(issue_id=issue.id).all():
            comment_string += comment.comment
        features.append(comment_string)
        if issue.issue_type_verified and issue.issue_type_verified == 'bug':
            features.append(1)
        elif issue.issue_type_verified:
            features.append(0)
        elif issue.issue_type and issue.issue_type.lower()!='bug':
            features.append(0)
        data.append(features)

    df = pd.DataFrame(data, columns=['id', 'title', 'description', 'discussion', 'classification'])
    return df


def clean_html(raw_text):
    clean_text = re.sub(clean_regex, '', raw_text)
    return clean_text

def remove_new_lines(raw_text):
    return raw_text.replace('\n', '')

def remove_programming_characters(raw_text):
    clean_text = raw_text.replace('==', '').replace('+', '').replace('-', '')
    return clean_text


def remove_punctuation(raw_text):
    return raw_text.translate(tbl)


def split_camel_case(tokens):
    splitted_tokens = []
    for token in tokens:
        splitted_tokens.extend(token.split("_"))

    return splitted_tokens


def tokenize(raw_text):
    raw_text = raw_text.lower()
    return raw_text.split(" ")


def porter_stemming(tokens):
    ps = PorterStemmer()
    stemmed = []
    for word in tokens:
        stemmed.append(ps.stem(word))
    return stemmed


def remove_stopwords(tokens):
    return [word for word in tokens if word not in stop_words]
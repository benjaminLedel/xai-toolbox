# xAI Toolbox
The xAI Toolbox uses Django as a backend framework and React as a frontend framework. 
The toolbox displays issues from software repositories of SmartSHARK 

![Training process](images/snippet1.PNG?raw=true "Training process")

## Local development
The following guide will help you to set up the project on your local device.
### Requirements
Requirements and how to get them with Ubuntu 20.04 LTS.
#### Python 3.9

```bash
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt-get update
sudo apt-get install python3.9
sudo apt-get install python3.9-dev
sudo apt-get install python3.9-venv
```

#### NPM
```bash
cd ~
sudo apt upate
sudo apt install nodejs npm
```

### Installation

#### Installation Backend
The backend assumes that a MySQL database is already existing for xAI Toolkit (can be empty).
If that is not the case create a database with your favorite tool before running migrate. Otherwise, you can use the SQLite database  (not recommended).

```bash
sudo apt-get install libmysqlclient-dev
git clone https://github.com/benjaminLedel/xai-toolbox.git
cd xai-toolbox
python3.9 -m venv .
source bin/activate
pip install -r requirements.txt
# change database credentials for MySQL DB and the secret key
nano backend/settings.py
# migrate database
python manage.py migrate
# create superuser
python manage.py createsuperuser
```

#### Installation Frontend
```bash
cd /srv/www/xaitoolkit/frontend
# install dependencies
npm install
npm run build
```

### Development

run backend in dev mode
```bash
cd /srv/www/xaitoolkit
source bin/activate
python manage runserver
```

run frontend in dev mode
```bash
cd /srv/www/xaitoolkit/frontend
npm run start
```

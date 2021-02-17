from configparser import ConfigParser

config = ConfigParser()

config['game'] = {
    'url': 'http://names.drycodes.com'
}

with open('./config/config.ini', 'w') as f:
      config.write(f)
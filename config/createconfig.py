from configparser import ConfigParser

config = ConfigParser()

config['game'] = {
    'url': 'http://names.drycodes.com'
}

config['crypto'] = {
    'aes128key': 'HideNdSeek123456',
    'aes192key': '@!**HideNdSeek123456**@!',
    'aes256key': '20210218@!**HideNdSeek123456**@!' 
}

with open('./config/config.ini', 'w') as f:
      config.write(f)
from Cryptodome.Cipher import AES
from base64 import b64encode, b64decode
from configparser import ConfigParser

config = ConfigParser()
config.read('./config/config.ini')

class AESCrypto:

    def __init__(self):
        self.aes256key = config.get('crypto', 'aes256key').encode('utf-8')

    def Encrypt(self, data):
        aes = AES.new(self.aes256key, AES.MODE_EAX)
        nonce = aes.nonce
        encdata, tag = aes.encrypt_and_digest(data.encode())
        return b64encode(encdata).decode('utf-8'), b64encode(tag).decode('utf-8'), b64encode(nonce).decode('utf-8')

        
    def Decrypt(self, encdata, tag, nonce):
        encdata = b64decode(encdata.encode('utf-8'))
        tag = b64decode(tag.encode('utf-8'))
        nonce = b64decode(nonce.encode('utf-8'))

        aes = AES.new(self.aes256key, AES.MODE_EAX, nonce)
        decdata = aes.decrypt_and_verify(encdata, tag)
        return decdata.decode('utf-8')
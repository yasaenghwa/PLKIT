import configparser


def get_api_key() -> str:
    config = configparser.ConfigParser()
    config.read("./config.conf")
    api_key = config["openai"]["api_key"]
    return api_key

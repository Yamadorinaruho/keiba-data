import os
import pickle
import time
import re
import datetime
import pandas as pd
from tqdm.notebook import tqdm
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import traceback


# ディレクトリの設定（pathlib を使用）
DATA_DIR = Path("../data")
DATA_RAW_DIR = DATA_DIR / "raw"
KAISAI_DATE_DIR = DATA_RAW_DIR  / "kaisai_date"
RACE_ID_DIR = DATA_RAW_DIR  / "race_id"
HTML_DIR = DATA_RAW_DIR  / "html"
HTML_RACE_DIR = HTML_DIR  / "race"


KAISAI_DATE_DIR.mkdir(parents=True, exist_ok=True)
RACE_ID_DIR.mkdir(parents=True, exist_ok=True)
HTML_DIR.mkdir(parents=True, exist_ok=True)
HTML_RACE_DIR.mkdir(parents=True, exist_ok=True)


def save_data(data, file_name, directory: Path):
    with open(directory / file_name, "wb") as f:
        pickle.dump(data, f)


def load_data(file_name, directory: Path):
    with open(directory / file_name, "rb") as f:
        return pickle.load(f)


def scrape_kaisai_date_list(from_, to_):
    """
    _関数の意味と使い方_
    この関数は、指定した期間の開催日を取得する関数です。
    開催日は、netkeiba.comのカレンダーページから取得します。
    この関数は、指定した期間の開催日をリストで返して保存します。
    すでに保存されている場合は、保存されたデータを読み込みます。
    """
    kaisai_date_list_file = f"kaisai_date_list_{from_}_to_{to_}.pkl"
    
    try:
        kaisai_date_list = load_data(kaisai_date_list_file, KAISAI_DATE_DIR)
    except Exception as e:
        kaisai_date_list = []
        for date in tqdm(pd.date_range(from_, to_, freq="MS")):
            year = date.year
            month = date.month
            url = (
                f"https://race.netkeiba.com/top/calendar.html?year={year}&month={month}"
            )
            req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
            html = urlopen(req).read()
            time.sleep(1)
            soup = BeautifulSoup(html, "lxml")
            a_list = soup.find("table", class_="Calendar_Table").find_all("a")
            for a in a_list:
                kaisai_date = re.findall(r"kaisai_date=(\d{8})", a["href"])[0]
                kaisai_date_list.append(kaisai_date)
        save_data(kaisai_date_list, kaisai_date_list_file, KAISAI_DATE_DIR)
    return kaisai_date_list


def scrape_race_id_list(from_, to_, kaisai_date_list=None):
    """
    _関数の意味と使い方_
    この関数は、指定した期間の開催日のレースIDを取得する関数です。
    開催日のレースIDは、netkeiba.comのレース一覧ページから取得します。
    この関数は、指定した期間の開催日のレースIDをリストで返して保存します。
    すでに保存されている場合は、保存されたデータを読み込みます。
    開催日は既存のデータを使用します。
    既存のデータがない場合は、scrape_kaisai_date_list関数を使用して取得します。
    """
    kaisai_date_list_file = f"kaisai_date_list_{from_}_to_{to_}.pkl"
    race_id_list_file = f"race_id_list_{from_}_to_{to_}.pkl"


    try:
        kaisai_date_list = load_data(kaisai_date_list_file, KAISAI_DATE_DIR)
    except Exception as e:
        print("kaisai_date_list が見つからなかったので、scrape_kaisai_date_list を呼び出します。")
        # ここで外部関数 scrape_kaisai_date_list を呼び出す
        kaisai_date_list = scrape_kaisai_date_list(from_, to_)

    try:
        race_id_list = load_data(race_id_list_file, RACE_ID_DIR)

    except Exception as e:
        options = Options()
        options.add_argument("--headless")
        race_id_list = []

        with webdriver.Chrome(options=options) as driver:
            for kaisai_date in tqdm(kaisai_date_list):
                url = f"https://race.netkeiba.com/top/race_list.html?kaisai_date={kaisai_date}"
                try:
                    driver.get(url)
                    time.sleep(1)
                    li_list = driver.find_elements(
                        By.CSS_SELECTOR, ".RaceList_DataItem"
                    )
                    for li in li_list:
                        href = li.find_element(By.TAG_NAME, "a").get_attribute("href")
                        race_id = re.findall(r"race_id=(\d{12})", href)[0]
                        race_id_list.append(race_id)
                except:
                    print(f"Error: {race_id}")
                    print(traceback.format_exc())
            save_data(race_id_list, race_id_list_file, RACE_ID_DIR)
    return race_id_list


def scrape_html_race(from_, to_, race_id_list=None):
    """
    _関数の意味と使い方_
    この関数は、指定した期間のレースIDのHTMLしbinファイルで保存する関数です。
    レースIDのHTMLは、netkeiba.comのレース詳細ページから取得します。
    race_id_listがある場合は、そのリストを使用します。
    race_id_listがない場合は、scrape_race_id_list関数を使用して取得します。
    """

    race_id_list_file = f"race_id_list_{from_}_to_{to_}.pkl"

    try:
        race_id_list = load_data(race_id_list_file, RACE_ID_DIR)
    except Exception as e:
        print("race_id_list が見つからなかったので、scrape_race_id_list を呼び出します。")
        race_id_list = scrape_race_id_list(from_, to_)

    for race_id in tqdm(race_id_list):
        file_path = HTML_RACE_DIR / f"{race_id}.bin"
        if file_path.exists():
            print(f"{file_path} はすでに存在します。")
        else:
            url = f"https://db.netkeiba.com/race/{race_id}"
            req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
            html = urlopen(req).read()
            time.sleep(1)
            with open(file_path, "wb") as f:
                f.write(html)
        
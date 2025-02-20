import pandas as pd
from bs4 import BeautifulSoup
from pathlib import Path
from tqdm.notebook import tqdm
import pickle
import re
from io import StringIO
import json


# ディレクトリの設定（pathlib を使用）
DATA_DIR = Path("../data")
KAISAI_DATE_DIR = DATA_DIR / "kaisai_date"
RACE_ID_DIR = DATA_DIR/ "race_id"
HORSE_ID_DIR = DATA_DIR / "horse_id"
JOCKEY_ID_DIR = DATA_DIR / "jockey_id"
TRAINER_ID_DIR = DATA_DIR / "trainer_id"
HTML_DIR = DATA_DIR / "html"
HTML_RASE_DIR = HTML_DIR / "race"
HTML_HORSE_DIR = HTML_DIR / "horse"
RAW_CSV_DIR = DATA_DIR / "raw_csv"


HORSE_ID_DIR.mkdir(parents=True, exist_ok=True)
JOCKEY_ID_DIR.mkdir(parents=True, exist_ok=True)
TRAINER_ID_DIR.mkdir(parents=True, exist_ok=True)
HTML_DIR.mkdir(parents=True, exist_ok=True)
HTML_RASE_DIR.mkdir(parents=True, exist_ok=True)
HTML_HORSE_DIR.mkdir(parents=True, exist_ok=True)
RAW_CSV_DIR.mkdir(parents=True, exist_ok=True)




def save_data(data, file_name, directory: Path):
    with open(directory / file_name, "wb") as f:
        pickle.dump(data, f)


def load_data(file_name, directory: Path):
    with open(directory / file_name, "rb") as f:
        return pickle.load(f)


def raw_race_csv(html_race_file_list=None):
    """
    _関数の意味と使い方_
    この関数は、レース結果のデータを取得しCSVファイルに保存する関数です。
    関数の引数は、html_race_file_listです。
    レース結果をDataFrameとして取得し、CSVファイルとして保存します。
    horse_id, jockey_id, trainer_idを追加しています。
    """
    html_race_file_list = list(HTML_RASE_DIR.glob("*.bin"))
    dfs = {}
    for html_race_file in tqdm(html_race_file_list):
        with open(html_race_file, "rb") as f:
            race_id = html_race_file.stem
            html = f.read()
            # BeautifulSoupで特定のテーブルだけを抽出
            soup = BeautifulSoup(html, 'html.parser')
            target_html = str(soup.find('table', class_='race_table_01'))
            df = pd.read_html(target_html)[0]  # 抽出したテーブルだけを変換
            
            # horse_id列を追加
            a_list = soup.find_all("a", href=re.compile(r"^/horse/"))
            horse_id_list = []
            for a in a_list:
                horse_id = re.findall(r"/horse/(\d+)", a["href"])[0]
                horse_id_list.append(horse_id)
            
            # jockey_id列を追加
            a_list = soup.find_all("a", href=re.compile(r"^/jockey/result/recent/"))
            jockey_id_list = []
            for a in a_list:
                jockey_id = re.findall(r"/jockey/result/recent/(\d+)", a["href"])[0]
                jockey_id_list.append(jockey_id)
            
            # trainer_id列を追加
            a_list = soup.find_all("a", href=re.compile(r"^/trainer/result/recent/"))
            trainer_id_list = []
            for a in a_list:
                trainer_id = re.findall(r"/trainer/result/recent/(\d+)", a["href"])[0]
                trainer_id_list.append(trainer_id)
                
            
            df["horse_id"] = horse_id_list
            df["jockey_id"] = jockey_id_list
            df["trainer_id"] = trainer_id_list
            df.index = pd.Index([race_id] * len(df))
            dfs[race_id] = df
    
    concat_df = pd.concat(dfs.values())
    concat_df.index.name = "race_id"
    concat_df.columns = [ "着順", "枠番", "馬番", "馬名", "性齢", "斤量", "騎手", "タイム", "着差", "単勝", "人気", "馬体重", "調教師", "horse_id", "jockey_id", "trainer_id"
    ]
    
    
    # CSVファイルとして保存
    output_file = RAW_CSV_DIR / f"raw_race.csv"
    concat_df.to_csv(output_file, encoding='utf-8', sep='\t')
    
    return concat_df



def create_id_list(raw_race_csv_dir=None):
    """
    この関数は、horse_id, jockey_id, trainer_idを取得しpickleファイルに保存する関数です。
    _DIRにあるCSVファイルから、horse_id, jockey_id, trainer_idを取得します。
    CSVファイル名はrace_raw.csvです。
    horse_id, jockey_id, trainer_idをリストで保存します。
    
    Args:
        race_results_dir (Path, optional): レース結果のCSVファイルがあるディレクトリ
    """
        
    horse_id_list = []
    jockey_id_list = []
    trainer_id_list = []
    
    # race.csvを読み込む
    race_results = pd.read_csv(RAW_CSV_DIR/ "raw_race.csv", encoding='utf-8', sep='\t')
    
    # 重複を除いてIDリストを作成
    horse_id_list = race_results['horse_id'].unique().tolist()
    jockey_id_list = race_results['jockey_id'].unique().tolist()
    trainer_id_list = race_results['trainer_id'].unique().tolist()
    
    # pickleファイルとして保存
    save_data(horse_id_list, "horse_id_list.pickle", HORSE_ID_DIR)
    save_data(jockey_id_list, "jockey_id_list.pickle", JOCKEY_ID_DIR)
    save_data(trainer_id_list, "trainer_id_list.pickle", TRAINER_ID_DIR)
    
    return horse_id_list, jockey_id_list, trainer_id_list


    
def create_horse_raw_csv(html_horse_file_list = None):
    """
    _関数の意味と使い方_
    この関数は、馬のHTMLを取得しCSVファイルに保存する関数です。
    関数の引数は、html_horse_dirです。
    馬のデータをDataFrameとして取得し、CSVファイルとして保存します。
    """
    dfs = {}
    html_horse_file_list = list(HTML_HORSE_DIR.glob("*.bin"))
    for html_horse_file in tqdm(html_horse_file_list):
        with open(html_horse_file, "rb") as f:
            horse_id = html_horse_file.stem
            html = f.read()
            # BeautifulSoupで特定のテーブルだけを抽出
            soup = BeautifulSoup(html, 'html.parser')
            table = soup.find('table', class_='db_h_race_results')
            if table is None:
                print(f"Warning: No table found in {html_horse_file}")
                continue
            df = pd.read_html(StringIO(str(table)))[0]  # 抽出したテーブルだけを変換
            df.index = [horse_id] * len(df)
            dfs[horse_id] = df
    
    concat_df = pd.concat(dfs.values())
    concat_df.index.name = "horse_id"
    concat_df.columns = ["日付", "開催", "天気", "R", "レース名", "映像", "頭数", 
    "枠番", "馬番", "オッズ", "人気", "着順", "騎手", "斤量", "距離", 
    "馬場", "馬場指数", "タイム", "着差", "タイム指数", "通過", 
    "ペース", "上り", "馬体重", "厩舎コメント", "備考", "勝ち馬", "賞金"
]
    
    
    # CSVファイルとして保存
    output_file = RAW_CSV_DIR / f"raw_horse.csv"
    concat_df.to_csv(output_file, encoding='utf-8', sep='\t')
    
    return concat_df

def raw_race_info_csv():
    """
    raceページのhtmlを読み込んで、レース情報テーブルに加工する関数。
    """
    dfs = {}
    html_path_list = list(HTML_RASE_DIR.glob("*.bin"))
    for html_path in tqdm(html_path_list):
        with open(html_path, "rb") as f:
            try:
                html = f.read()
                soup = BeautifulSoup(html, "lxml").find("div", class_="data_intro")
                info_dict = {}
                info_dict["title"] = soup.find("h1").text
                p_list = soup.find_all("p")
                info_dict["info1"] = re.findall(
                    r"[\w:]+", p_list[0].text.replace(" ", "")
                )
                info_dict["info2"] = re.findall(r"\w+", p_list[1].text)
                df = pd.DataFrame().from_dict(info_dict, orient="index").T

                # ファイル名からrace_idを取得
                race_id = html_path.stem
                df.index = [race_id] * len(df)
                dfs[race_id] = df
            except IndexError as e:
                print(f"table not found at {race_id}")
                continue
    concat_df = pd.concat(dfs.values())
    concat_df.index.name = "race_id"
    concat_df.columns = concat_df.columns.str.replace(" ", "")
    concat_df.to_csv(RAW_CSV_DIR / "raw_race_info.csv", sep="\t")
    return concat_df.reset_index()

def raw_race_return_csv():
    """
    raceページのhtmlを読み込んで、払い戻しテーブルに加工する関数。
    """
    dfs = {}
    html_path_list = list(HTML_RASE_DIR.glob("*.bin"))
    for html_path in tqdm(html_path_list):
        with open(html_path, "rb") as f:
            try:
                html = f.read().decode('euc-jp')
                soup = BeautifulSoup(html, 'html.parser')
                pay_block = soup.find('dl', class_='pay_block')
                df = pd.concat(pd.read_html(str(pay_block)))

                # ファイル名からrace_idを取得
                race_id = html_path.stem
                # 最初の列にrace_idを挿入
                df.insert(0, "race_id", race_id)
                dfs[race_id] = df
            except IndexError as e:
                print(f"table not found at {html_path}")
                continue
    concat_df = pd.concat(dfs.values())
    concat_df.to_csv(RAW_CSV_DIR / "raw_race_return.csv", sep="\t")
    return concat_df.reset_index()

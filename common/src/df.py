import json
from pathlib import Path

import pandas as pd

DATA_DIR = Path("../data")
RAW_CSV_DIR = DATA_DIR / "raw_csv"
DF_CSV_DIR = DATA_DIR / "df_csv"
MAPPING_DIR = DATA_DIR / "mapping"

DF_CSV_DIR.mkdir(parents=True, exist_ok=True)


# カテゴリ変数を数値に変換するためのマッピング
with open(MAPPING_DIR / "sex.json", "rb") as f:
    sex_mapping = json.load(f)
with open(MAPPING_DIR / "race_type.json", "rb") as f:
    race_type_mapping = json.load(f)
with open(MAPPING_DIR / "around.json", "rb") as f:
    around_mapping = json.load(f)
with open(MAPPING_DIR / "weather.json", "rb") as f:
    weather_mapping = json.load(f)
with open(MAPPING_DIR / "ground_state.json", "rb") as f:
    ground_state_mapping = json.load(f)
with open(MAPPING_DIR / "race_class.json", "rb") as f:
    race_class_mapping = json.load(f)
with open(MAPPING_DIR / "margin.json", "rb") as f:
    margin_mapping = json.load(f)


def df_race_csv():
    """
    未加工のレース結果テーブルをinput_dirから読み込んで加工し、保存する関数
    """
    df = pd.read_csv(RAW_CSV_DIR/ "raw_race.csv", sep="\t")
    df["rank"] = pd.to_numeric(df["着順"], errors="coerce")
    df.dropna(subset=["rank"], inplace=True)
    df["rank"] = df["rank"].astype(int)
    df["umaban"] = df["馬番"].astype(int)
    df["tansho_odds"] = df["単勝"].astype(float)
    df["popularity"] = df["人気"].astype(int)
    df["impost"] = df["斤量"].astype(float)
    df["wakuban"] = df["枠番"].astype(int)
    df["sex"] = df["性齢"].str[0].map(sex_mapping)
    df["age"] = df["性齢"].str[1:].astype(int)
    df["weight"] = df["馬体重"].str.extract(r"(\d+)").astype(int)
    df["weight_diff"] = df["馬体重"].str.extract(r"\((.+)\)").astype(int)
    df["horse_name"] = df["馬名"]
    df["jockey_name"] = df["騎手"]
    df["trainer_name"] = df["調教師"]
    # データが着順に並んでいることによるリーク防止のため、各レースを馬番順にソートする
    df = df.sort_values(["race_id", "umaban"])
    # 使用する列を選択
    df = df[
        [
            "race_id","horse_id","horse_name","jockey_id","jockey_name","trainer_id","trainer_name","rank","umaban","wakuban","tansho_odds","popularity","impost","sex","age","weight","weight_diff"
        ]
    ]
    df.to_csv(DF_CSV_DIR / "df_race.csv", sep="\t", index=False)
    return df


def df_horse_csv():
    """
    未加工の馬の過去成績テーブルを読み込み、加工して保存する関数
    """
    df = pd.read_csv(RAW_CSV_DIR/ "raw_horse.csv", sep="\t")
    df["rank"] = pd.to_numeric(df["着順"], errors="coerce")
    df.dropna(subset=["rank"], inplace=True)
    df["date"] = pd.to_datetime(df["日付"])
    df["weather"] = df["天気"].map(weather_mapping)
    df["race_type"] = df["距離"].str[0].map(race_type_mapping)
    df["course_len"] = df["距離"].str.extract(r"(\d+)").astype(int)
    df["ground_state"] = df["馬場"].map(ground_state_mapping)
    # 着差は1着以外は「1着との差」を表すが、1着のみ「2着との差」のデータが入っている
    df["rank_diff"] = df["着差"].map(lambda x: 0 if x < 0 else x)
    df["prize"] = df["賞金"].fillna(0)
    regex_race_class = "|".join(race_class_mapping)
    df["race_class"] = (
        df["レース名"].str.extract(rf"({regex_race_class})")[0].map(race_class_mapping)
    )
    df.rename(columns={"頭数": "n_horses"}, inplace=True)
    # 使用する列を選択
    df = df[
        [
            "horse_id",
            "date",
            "rank",
            "prize",
            "rank_diff",
            "weather",
            "race_type",
            "course_len",
            "ground_state",
            "race_class",
            "n_horses",
        ]
    ]
    df.to_csv(DF_CSV_DIR/ "df_horse.csv", sep="\t", index=False)
    return df



def df_race_info_csv():
    """
    未加工のレース情報テーブルを読み込み、加工して保存する関数
    """
    df = pd.read_csv(RAW_CSV_DIR / "raw_race_info.csv", sep="\t")
    # evalで文字列型の列をリスト型に変換し、一時的な列を作成
    df["tmp"] = df["info1"].map(lambda x: eval(x)[0])
    # ダートor芝or障害
    df["race_type"] = df["tmp"].str[0].map(race_type_mapping)
    # 右or左or直線
    df["around"] = df["tmp"].str[1].map(around_mapping)
    df["course_len"] = df["tmp"].str.extract(r"(\d+)")
    df["weather"] = df["info1"].str.extract(r"天候:(\w+)")[0].map(weather_mapping)
    df["ground_state"] = (
        df["info1"].str.extract(r"(芝|ダート|障害):(\w+)")[1].map(ground_state_mapping)
    )
    df["date"] = pd.to_datetime(
        df["info2"].map(lambda x: eval(x)[0]), format="%Y年%m月%d日"
    )
    regex_race_class = "|".join(race_class_mapping)
    df["race_class"] = (
        df["title"]
        .str.extract(rf"({regex_race_class})")
        # タイトルからレース階級情報が取れない場合はinfo2から取得
        .fillna(df["info2"].str.extract(rf"({regex_race_class})"))[0]
        .map(race_class_mapping)
    )
    df["place"] = df["race_id"].astype(str).str[4:6].astype(int)
    # 使用する列を選択
    df = df[
        [
            "race_id",
            "date",
            "race_type",
            "around",
            "course_len",
            "weather",
            "ground_state",
            "race_class",
            "place",
        ]
    ]
    df.to_csv(DF_CSV_DIR/ "df_race_info.csv", sep="\t", index=False)
    return df


def df_race_return_csv():
    """
    未加工の払い戻しテーブルを読み込み、加工して保存する関数
    """
    df = pd.read_csv(RAW_CSV_DIR / "raw_race_return.csv", sep="\t")
    df = (
        df[["0", "1", "2"]]
        .replace(" (-|→) ", "-", regex=True)
        .replace(",", "", regex=True)
        .apply(lambda x: x.str.split())
        .explode(["1", "2"])
        .explode("0")
        .apply(lambda x: x.str.split("-"))
        .explode(["0", "2"])
    )
    df.columns = ["bet_type", "win_umaban", "return"]
    df = df.query("bet_type != '枠連'").reset_index()
    df["return"] = df["return"].astype(int)
    df.to_csv(DF_CSV_DIR/ "df_race_return.csv", sep="\t", index=False)
    return df
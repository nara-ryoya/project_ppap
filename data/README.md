# データの詳細
## station_area.json
手打ちで駅の所属エリアを入れている。

## station_customer.json
[JR発表のデータ](https://www.jeki.co.jp/transit/mediaguide/data/pdf/MD_018-035.pdf)

女性の既婚と未婚の区分は良くない気がしたので合算している。

## station_data.json
node タブで使用する各種データ。

## station_data_normalized.json
駅の乗降客数で値を割って「正規化」したデータ。不採用

## station_data_old.json
node タブで使用する各種データの古いバージョン。
コメント数じゃなくて単純に店舗数だったらどうなるのか、という比較用。

## station_location.json
奈良が持ってきた駅データから算出。

## station_passengers.json
[国土交通省が発表したデータを整形したもの(東京都)](https://opendata-web.site/station/13/)

## tabelog.json
主に食べログの統計情報に関するデータ。

## tabelog_counts.json
駅から800m以内の各ジャンル・価格帯ごとの店舗数。

## tabelog_details.json
駅から800m以内のもの (コメント上位 max 1200件)。不採用。

## tabelog_old.json
食べログの古いやつのデータ。不採用。

## (駅名)_nearbydata.json
各 type ごとにヒットしたスポットの詳細データ

## (駅名)_tweets.txt
Twitter で (駅名) を含むツイート

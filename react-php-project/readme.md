### PHP + React CRUD

## 概要

- ReactJSとPHPMySQLiを使用してCRUDアプリケーションを作成する方法を学ぶ

## Docker環境

<details>
<summary>docker-compose.yml</summary>

```yaml:
version: '3.4'
x-logging:
  &default-logging
  driver: "json-file"
  options:
    max-size: "100k"
    max-file: "3"
volumes:
  mysql_data: { driver: local }
services:

  mysql:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: db
      MYSQL_USER: user
      MYSQL_PASSWORD: password
      TZ: 'Asia/Tokyo'
    volumes:
    - mysql_data:/var/lib/mysql

  www:
    build:
      context: .
      dockerfile: Dockerfile-php
    logging: *default-logging
    volumes:
    - ./www:/var/www
    - ./www/php.ini:/usr/local/etc/php/php.ini
    environment:
    - DB_CONNECTION=mysql
    - DB_HOST=mysql
    - DB_DATABASE=db
    - DB_USERNAME=user
    - DB_PASSWORD=password
    ports: 
    - "80:80"

  app:
    build:
      context: .
      dockerfile: Dockerfile-node
    logging: *default-logging
    volumes:
    - ./app/:/app/
    command: sh
    tty: true
    ports: 
    - "8001:8001"
```
</details>

<details>
<summary>Dockerfile-php</summary>

```Dockerfile:
FROM php:7.3-apache

RUN apt update && apt-get install -y git libzip-dev
RUN docker-php-ext-install pdo_mysql zip

RUN a2enmod rewrite

WORKDIR /var/www

RUN docker-php-ext-install opcache
RUN pecl install apcu
RUN docker-php-ext-enable apcu
```
</details>

<details>
<summary>Dockerfile-node</summary>

```Dockerfile:
FROM node:10-alpine
  
ENV APP_PORT 8001
ENV APP_ROOT /app
EXPOSE $APP_PORT
WORKDIR $APP_ROOT

CMD [ "sh" ]

RUN apk update && \
    apk add git openssh curl jq && \
    curl -o- -L https://yarnpkg.com/install.sh | sh

RUN apk add python make g++
```
</details>

## コンテナ起動

```sh:
apple@appurunoMacBook-Pro react-php-project % docker-compose up -d
Creating react-php-project_mysql_1 ... done
Creating react-php-project_app_1   ... done
Creating react-php-project_www_1   ... done
```

## データベースのセットアップ

- 「users」テーブルと「users」テーブルの構造を作成
- mysqlコンテナに入り、下記のSQLを発行する

```sql:
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_email` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
   PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

<details>
<summary>詳細</summary>

```sh:
apple@appurunoMacBook-Pro react-php-project % docker-compose exec mysql bash
root@90ff1349b046:/# mysql -uuser -ppass -Ddb
mysql> CREATE TABLE `users` (
    ->   `id` int(11) NOT NULL AUTO_INCREMENT,
    ->   `user_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
    ->   `user_email` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
    ->    PRIMARY KEY (`id`)
    -> ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
mysql> show tables;
+--------------+
| Tables_in_db |
+--------------+
| users        |
+--------------+
1 row in set (0.00 sec)
mysql> desc users;
+------------+--------------+------+-----+---------+----------------+
| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+
| id         | int(11)      | NO   | PRI | NULL    | auto_increment |
| user_name  | varchar(100) | NO   |     | NULL    |                |
| user_email | varchar(50)  | NO   |     | NULL    |                |
+------------+--------------+------+-----+---------+----------------+
3 rows in set (0.01 sec)
```
- データベースエンジンは「InnoDB」
  - InnoDB: トランザクションに対応したデータベースエンジン (PostgreSQLに似たACID互換のトランザクションに対応)
  - ※ MySQL5.5からトランザクション処理ができる『InnoDB』がデフォルトストレージとなっている
  - 他のエンジンとして「MyISAM」というものがある
</details>

## PHPファイルの作成

- ドキュメントルート（Xampp htdocs配下）は www/html 配下になるのでそこにPHPファイルを設置していく

<details>
<summary>PHPの動作確認</summary>

- 試しに`www/html/`にディレクトリを切って、下記のような`test.php`を配置する
```php:
<?php phpinfo();
```
- localhostをブラウザから確認してみるも、`You don't have permission to access this resource.`と403エラーが返ってくる場合は下記を参考にすると良い
```sh:
apple@appurunoMacBook-Pro react-php-project % docker-compose exec www bash

# 権限の確認
root@e210de531d8a:/var/www# ls -la
total 4
drwxr-xr-x 4 root root  128 Feb 24 13:49 .
drwxr-xr-x 1 root root 4096 Feb  1 19:26 ..
drwxr-xr-x 3 root root   96 Feb 24 13:49 html
drwxr-xr-x 2 root root   64 Feb 24 09:42 php.ini

# OSの確認
root@e210de531d8a:/etc# cat /etc/debian_version 
10.2

# 'apache2'サービスに使用されるユーザ名を探す
root@e210de531d8a:/etc# cat /etc/apache2/envvars
# /etc/init.d/apache2, /etc/logrotate.d/apache2, etc.
: ${APACHE_RUN_USER:=www-data}
export APACHE_RUN_USER
: ${APACHE_RUN_GROUP:=www-data}
export APACHE_RUN_GROUP

# Debine系のApache実行ユーザは「www-data」でありuid:gid=33:33
root@e210de531d8a:/var/www/html# id www-data
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```
</details>

**db_connection.phpの作成**

- PHPでMySQLサーバーへ接続するファイルを作成する
```php:www/html/db_connection.php
<?php
<?php
$db_conn = mysqli_connect("mysql","user","pass","db");
if (!$db_conn) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
    echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
    exit;
}

echo "Success: A proper connection to MySQL was made! The my_db database is great." . PHP_EOL;
echo "Host information: " . mysqli_get_host_info($db_conn) . PHP_EOL;

mysqli_close($db_conn);
```

<details>
<summary>Call to undefined function mysqli_connect()が発生してエラー落ちする場合</summary>

- php-mysqliモジュールをインストールしていない事が原因
- 解決策1： mysqli関数を使えるようにdockerfileを以下のように書き換えてbuildし直す
```Dockerfile:
FROM php:7.3-apache
RUN apt-get update && docker-php-ext-install mysqli pdo_mysql
```
- 解決策2： コンテナの中に入ってモジュールをインストールしてコンテナの再起動
```sh:
apple@appurunoMacBook-Pro react-php-project % docker-compose exec www bash
root@b0fcc5b5e447:/var/www# docker-php-ext-install mysqli
apple@appurunoMacBook-Pro react-php-project % docker-compose restart  
```

- DockerHubで提供されているPHPのイメージでは、PHPの拡張機能をインストールするためのスクリプト(`docker-php-ext-*`)が使用できる
  - 公式レポジトリ：https://github.com/docker-library/php/tree/1eb2c0ab518d874ab8c114c514e16aa09394de14/7.3/stretch/apache
  - 引数を元によしなにPHP拡張昨日なモジュールをインストールしてくれる
  - docker-php-ext-configure：引数を元にphpizeやconfigure実行してくれる
  - docker-php-ext-install：引数を元にエクステンションをインストールしてくれる
  - docker-php-ext-enable：引数を元にエクステンションを有効にしてくれる
</details>

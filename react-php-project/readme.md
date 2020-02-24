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
root@90ff1349b046:/# mysql -uuser -ppass
mysql> use db;
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

```
</details>
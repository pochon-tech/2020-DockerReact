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
$db_conn = mysqli_connect("mysql","user","pass","db");
// if (!$db_conn) {
//     echo "Error: Unable to connect to MySQL." . PHP_EOL;
//     echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
//     echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
//     exit;
// }

// echo "Success: A proper connection to MySQL was made! The my_db database is great." . PHP_EOL;
// echo "Host information: " . mysqli_get_host_info($db_conn) . PHP_EOL;

// mysqli_close($db_conn);
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


**CRUD系のファイルの作成**

- ユーザを追加するファイル`src/html/add-user.php`を作成する
```php:add-user.php
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require 'db_connection.php';

// post
$data = json_decode(file_get_contents("php://input"));

if (isset($data->user_name)
    && isset($data->user_email) 
	&& !empty(trim($data->user_name)) 
	&& !empty(trim($data->user_email))
	){
    // エスケープ 
    $username = mysqli_real_escape_string($db_conn, trim($data->user_name));
    $useremail = mysqli_real_escape_string($db_conn, trim($data->user_email));
    // Validate Email
    if (filter_var($useremail, FILTER_VALIDATE_EMAIL)) {
        // DBへ登録、返り値はbool
        $insertUser = mysqli_query($db_conn,"INSERT INTO `users`(`user_name`,`user_email`) VALUES('$username','$useremail')");
        if ($insertUser){
            // 直近のクエリで使用した自動生成のID
            $last_id = mysqli_insert_id($db_conn);
            echo json_encode(["success"=>1,"msg"=>"User Inserted.","id"=>$last_id]);
        } else {
            echo json_decode(["success"=>0,"msg"=>"User Not Inserted!"]);
        }
    } else{
        echo json_encode(["success"=>0,"msg"=>"Invalid Email Address!"]);
    }
} else {
    echo json_encode(["success"=>0,"msg"=>"Please fill all the required fields!"]);
}
mysqli_close($db_conn);
```

- ユーザを全件取得するファイル`src/html/all-users.php`を作成する
```php:all-users.php
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require 'db_connection.php';

$allUsers = mysqli_query($db_conn,"SELECT * FROM `users`");
if (mysqli_num_rows($allUsers) > 0){
    $all_users = mysqli_fetch_all($allUsers,MYSQLI_ASSOC);
    echo json_encode(["success"=>1,"users"=>$all_users]);
} else {
    echo json_encode(["success"=>0]);
}
mysqli_close($db_conn);
```

- ユーザを更新するファイル`src/html/update-user.php`を作成する
```php:update-user.php
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require 'db_connection.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->id) 
	&& isset($data->user_name) 
	&& isset($data->user_email) 
	&& is_numeric($data->id) 
	&& !empty(trim($data->user_name)) 
	&& !empty(trim($data->user_email))
	){
    $username = mysqli_real_escape_string($db_conn, trim($data->user_name));
    $useremail = mysqli_real_escape_string($db_conn, trim($data->user_email));
    if (filter_var($useremail, FILTER_VALIDATE_EMAIL)) {
        $updateUser = mysqli_query($db_conn,"UPDATE `users` SET `user_name`='$username', `user_email`='$useremail' WHERE `id`='$data->id'");
        if ($updateUser) {
            echo json_encode(["success"=>1,"msg"=>"User Updated."]);
        } else {
            echo json_encode(["success"=>0,"msg"=>"User Not Updated!"]);
        }
    } else {
        echo json_encode(["success"=>0,"msg"=>"Invalid Email Address!"]);
    }
} else {
    echo json_encode(["success"=>0,"msg"=>"Please fill all the required fields!"]);
}
mysqli_close($db_conn);
```

- ユーザを削除するファイル`src/html/delete-user.php`を作成する
```php:delete-user.php
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require 'db_connection.php';

$data = json_decode(file_get_contents("php://input"));
if(isset($data->id) && is_numeric($data->id)){
    $delID = $data->id;
    $deleteUser = mysqli_query($db_conn,"DELETE FROM `users` WHERE `id`='$delID'");
    if($deleteUser){
        echo json_encode(["success"=>1,"msg"=>"User Deleted"]);
    } else {
        echo json_encode(["success"=>0,"msg"=>"User Not Found!"]);
    }
} else {
    echo json_encode(["success"=>0,"msg"=>"User Not Found!"]);
}
mysqli_close($db_conn);
```

- 今回は手続き型でmysqliを実装している

<details>
<summary>include()とrequire()の違い</summary>

- PHPで外部ファイルを読み込む場合、`require`、`require_once`、`include`、`include_once`の４種類の読み込み方が存在する

**require**
> require は include とほぼ同じですが、失敗した場合に E_COMPILE_ERROR レベルの致命的なエラーも発生するという点が異なります。 
> つまり、スクリプトの処理がそこで止まってしまうということです。
> 一方 include の場合は、警告 (E_WARNING) を発するもののスクリプトの処理は続行します。
- requireは指定されたファイルが読み込めない場合、Fatal Error(致命的なエラー)となり処理が停止

**require_once**
> require_once 文は require とほぼ同じ意味ですが、 ファイルがすでに読み込まれているかどうかを PHP がチェックするという点が異なります。
> すでに読み込まれている場合はそのファイルを読み込みません。
- ファイルがすでに読み込まれている場合は再読み込みしない

**include**
> include は、ファイルを見つけられない場合に warning を発行します。
> 一方 require の場合は、同じ場合に fatal error を発行する点が異なります。
- includeは指定されたファイルが読み込めない場合、Warning(警告)となるがその先の処理はそのまま実行

**include_once**
> include_once 命令は、スクリプトの実行時に指定 したファイルを読み込み評価します。
> この動作は、 include 命令と似ていますが、ファイルからのコー ドが既に読み込まれている場合は、再度読み込まれないという重要な違い があります。また、include_once は TRUE を返します。
> その名が示す通り、ファイルは一度しか読み込まれません。
- ファイルがすでに読み込まれている場合は再読み込みしない

**使い分け**
- ファイルが読み込めない場合に処理を停止する場合はrequireを使用
- 一度しか読み込まなくていいものは_onceをつける

</details>

<details>
<summary>filter_var関数</summary>

- フォームの値をチェックする等のバリデート関数
- preg_macth等を使わなくても手軽に行えるバリデート関数
- pregと同じ感じで正規表現でのチェックも行える（以下は電話番号の検証例）
```php:
$reg = '03-123';
// filter_var(チェックしたい値, FILTER_VALIDATE_REGEXP, array(‘options’ => array(‘regexp’ => チェックパターン)))
$options = array('options' => array('regexp' => '/^0\d{1,5}-?\d{0,4}-?\d{4}$/'));
$value = filter_var($reg, FILTER_VALIDATE_REGEXP, $options);
var_dump($value);
 
=> boolean false
```
- コールバックフィルターとかも存在する
```php:
// filter_var(コールバック関数の引数, FILTER_CALLBACK, array(‘options’ => コールバック関数名を指定))
function chars_count($str)
{
    $cnt = mb_strlen($str);
    if ($cnt > 10 ) {
        return $str;
    } else {
        return false;
    }
 
}
$callback = "文字列カウント";
$str = filter_var($callback, FILTER_CALLBACK, array('options' => 'chars_count'));
var_dump($str);
 
=> boolean false
```
- オプションを配列で取る方法
```php:
$options = array(
    'options' => array(
        'default' => '値に収まりませんでした。', // フィルタが失敗した場合に返す値
        // その他のオプションをここ
        'min_range' => 0,
        'max_range' => 100,
    ),
    'flags' => FILTER_FLAG_ALLOW_OCTAL,
);
$var = filter_var('200', FILTER_VALIDATE_INT, $options);
var_dump($var);
 
=> string '値に収まりませんでした。'
```
</details>


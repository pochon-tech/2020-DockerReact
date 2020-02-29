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

## React Appを作成する

**準備**

- create-react-appを使用してReactアプリを作成する
```sh:
apple@appurunoMacBook-Pro react-php-project % docker-compose exec app sh
/app npx create-react-app react-app
```
- 開発Portの変更とホットリロードの適用するために、.envファイルをプロジェクト直下に設置
```.env
PORT=8001
CHOKIDAR_USEPOLLING=true
```
- CSSはbootstrapを使用するので、/public/index.htmlのheadセクションに下記を貼り付ける
```
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
```
- 下記不要ファイルを削除する
  - App.css
  - App.test.js
  - index.css
  - logo.svg
  - setupTest.js
  - public/logo192.png
  - public/logo512.png
  - public/robots.txt

<details>
<summary>Reactおさらい（読まなくて良い）</summary>

**JSX**
- ReactではJSXと呼ばれるJavaScriptの拡張を使用してReact要素を簡便な形式で作成
```js:
import React from 'react';
import ReactDOM from 'react-dom';

var greeting = React.createElement('h1', null, 'Hi!'); // React.createElement メソッドで React 要素を作成

ReactDOM.render( // ReactDOM.render メソッドで、それを出力
  greeting,
  document.getElementById('root')
);
```

**React.Component**
- コンポーネントは`React.Component`から派生したクラスとして作成し、`render`メソッドでビューとなる`JSX`を返す
```js:
import React from 'react';
// import React, { Component } from 'react'; // 先頭の import ラインで次のように Component メンバーまでインポートもできる

class Greeting extends React.Component {
  render() {
    return <h1>Hi!</h1>;
  }
}

export default Greeting;
```

**Reactのプロパティ**
- Reactコンポーネントには`プロパティ`を設定できる
```js:
import React from 'react';
import ReactDOM from 'react-dom';
import Greeting from './Greeting';

ReactDOM.render(
  <Greeting firstName="Hanako"/>, // firstName というプロパティをコンポーネントに設定
  document.getElementById('root')
);
```
- コンポーネント側のコード内では、`this.props.<プロパティ名>`で参照できる
```js:
import React from 'react';

class Greeting extends React.Component {
  render() {
    return <h1>Hi {this.props.firstName} san!</h1>;
  }
}

export default Greeting;
```

**クラス継承でのプロパティ**
- ES6からclass...extendsでクラスの継承ができるようになった
```js:
import React from 'react';

class Greeting extends React.Component {
  render() {
    return <h1>Hi {this.props.firstName} san!</h1>;
  }
}

export default Greeting;
```
```js:
import Animal from './Animal';

export default class Cat extends Animal {

  /** 
   * constructor にて、prop を受取り、super にそれを渡すことで基底クラス (Animal クラス) のコンストラクタに prop を渡して
   * */
  constructor(props){
    super(props);
  }

  render() {
    return (
      <div>
        <h2>I'm a cat. </h2>
        {super.saySomething()}
      </div>
    );
  }
}
```
```js:
import React from 'react';
import ReactDOM from 'react-dom';
import Animal from './Animal';
import Cat from './Cat';

ReactDOM.render(
  <div>
    <Animal/>
    <Cat firstName="Tora"/>
  </div>,
  document.getElementById('root')
);
```

**ライフサイクル**
- コンポーネントが画面にレンダリングされることをマウントという
- コンポーネントが作成され、マウントされる前、マウント時、マウントされた後、それぞれにメソッドがコールバックされる
  - constructor: コンポーネントが作成されたとき
  - componentWillMount: マウントされる前
  - render: マウント
  - componentDidMount: マウントされた後
```js:

export default class Person extends React.Component {

  constructor(props){
    console.log('constructor');
    super(props);
  }

  componentWillMount(){
    console.log('componentWillMount');
  }

  componentDidMount(){
    console.log('componentDidMount');
  }

  componentWillUnmount(){
    console.log('componentWillUnmount');
  }

  componentWillUpdate(nextProps, nextState){
    console.log('componentWillUpdate');
  }

  componentDidUpdate(prevProps, prevState){
    console.log('componentDidUpdate');
  }

  componentWillReceiveProps(nextProps){
    console.log('componentWillReceiveProps');
  }

  shouldComponentUpdate(nextProps, nextState){
    console.log('shouldComponentUpdate');
  }

  render() {
    console.log('render');
    return <div>Person</div>;
  }
}
```

**コンポーネントの状態とイベント処理**
- 具体例:
  - ボタンがある
  - ボタンには数字が書かれている
  - ボタンをクリックする度に数字が3ずつ増える
- 着目点は:
  - ボタンがクリックされた回数を保持している
  - クリックイベントに応答している
  - 表示を書き換えている
- ソースコード:
```js:
import React from 'react';

export default class ButtonComponent extends Resact.Component {
  constructor(props){
    console.log('constructor');
    super(props);
    this.state = { count: 0 };
    this.onClick = this.onClick.bind(this)
  }

  onClick(){
    console.log('onClick');
    this.setState((prevState, props) => {
      console.log('setState | prevState.count = ' + prevState.count);
      return { count: ++prevState.count }
    });
  }
  
  componentWillMount(){
    console.log('componentWillMount');
  }

  componentDidMount(){
    console.log('componentDidMount');
  }

  componentWillUnmount(){
    console.log('componentWillUnmount');
  }

  componentWillUpdate(nextProps, nextState){
    console.log('componentWillUpdate');
    console.log(nextState);
  }

  componentDidUpdate(prevProps, prevState){
    console.log('componentDidUpdate');
    console.log(prevState);
  }

  componentWillReceiveProps(nextProps){
    console.log('componentWillReceiveProps');
  }

  shouldComponentUpdate(nextProps, nextState){
    console.log('shouldComponentUpdate');
    return true;
  }
  render() {
    console.log('render');
    var buttonStyle = {
      width: 100,
      height: 100,
      backgroundColor: "#3F51B5",
      color: "rgba(255,255,255,.87)",
      border: "none",
      borderRadius: 20,
      fontSize: 48,
      fontWeight: "bold"
    };
    return (
      <button style={buttonStyle} onClick={this.onClick}>
        {this.state.count}
      </button>
    );
  }
}
```
- constructorで行っている事:
  - プロパティを受取り`super`で基底クラスのコンストラクタに渡す（お約束）
  - `this.state`に`{ count: 0 }`という**状態(state)**を設定 (`this.state`を初期化している)
    - Reactコンポーネントは**state**というメンバーを持つ
    - これが**状態を保持する場所**になる
  - ボタンのクリックイベントハンドラとして、CountButtonクラス内のonClickメソッドを指定している
    - ES6クラスのメソッドは、既定ではイベントハンドラにバインドされない
    - メソッドをイベントハンドラに指定するためには`this.メソッド = this.メソッド.bind(this)`を行う必要がある
    > 例えば、fooが関数オブジェクトのとき、`foo.bind(this)`とすると、bindメソッドはthisを受け取る新しい`バウンド関数(BF)`を生成する
    > BFは`エキゾチック関数オブジェクト`と呼ばれ、元の関数をラップして、内部にある元の関数を呼び出す関数オブジェクトを指す
- renderメソッドで行っている事:
  - ボタンのスタイルを指定している
  - ボタンのクリックイベントを設定している (`onClick={this.onClick}`)
  - `{this.state.count}`はボタンに表示する文字
- onClickメソッドで行っている事:
  - `this.setState`メソッドを呼び出している
  - `this.setState`は**アップデータメソッド**を受取る
    - アップデータメソッドは、`(prevState, props) => (新しい状態)`という形をしている
    - 現在の状態 (`this.state`) を`prevState`として受け取り、`this.state`にセットするオブジェクトを返せば良い
- shouldComponentUpdateが行っている事:
  - これまでで、`this.onClick`で`this.setState()`を呼ぶ事で`this.state`を更新した
  - ボタンのラベルの数字を更新したい
  - 実は、`this.setState()`を呼ぶと、ライフサイクルのひとつとして`shouldComponentUpdate`メソッドが呼ばれるのである
  - `shouldComponentUpdate`でtrueを返すことで、**更新処理が必要である**と指定される (falseを返すと更新処理は行われない)
  - trueを返す事で、`shouldComponentUpdate` -> `componentWillUpdate` -> `render` -> `componentDidUpdate` が呼ばれる
  - 今回はボタンの表示が切り替われば良いので、`render`が呼び出されば良いので、特に追加処理は必要ない

**シンセティックイベント**
- シンセティックイベントとは**イベントプーリング**のこと
- **ReactではSyntheticイベントを受け取る:**
  - イベント処理は昔からブラウザの互換性に問題があるとされている
  - ブラウザごとに異なるタイプのオブジェクトを受け取り、ブラウザ間で同じような動作を実現することは難しかった
  - まさにこれこそが、各種ラッパーライブラリを使う動機の一つ
  - Reactでも、イベントハンドラでは`Synthetic`イベントを受けとることになっている
  > Synthetic イベントは次のようなプロパティやメソッドを持っている
  > boolean bubbles
  > boolean cancelable
  > DOMEventTarget currentTarget
  > boolean defaultPrevented
  > number eventPhase
  > boolean isTrusted
  > DOMEvent nativeEvent
  > void preventDefault()
  > boolean isDefaultPrevented()
  > void stopPropagation()
  > boolean isPropagationStopped()
  > DOMEventTarget target
  > number timeStamp
  > string type
  - `preventDefault()`や`stopPropagation`などのDOMイベントのメソッドはすぐに呼べるようになっていて便利
  - オブジェクトの元のDOMターゲットは`target`でとれる

**イベントプーリング**
- Syntheticイベントを使用する際に気をつけないといけないのがイベントプーリングであること
  - パフォーマンス向上のために、Syntheticイベントオブジェクトは、あらかじめ作成されてプールされている
  - つまり、Syntheticイベントオブジェクトは作り置きされているのである
  - 作り置きされて、そのオブジェクトのプロパティだけ差し替えられて次々と使われる仕組みになっている
  - そのため、無駄なオブジェクトの生成を抑える事ができてパフォーマンスの向上につながっている
  - しかし、使うときに注意が必要
- 例：テキストボックスに入力された文字列が、直下に表示される
```js:
import React from 'react';

export default class CCText extends React.Component {
  constructor(props) {
      super(props);
      this.state = { s: '' };
      this.onChange = this.onChange.bind(this);
  }
  
  onChange(e) {
    var v = e.target.value;
    this.setState((prevState, props) => {
      return { s: v }
    });
  }

  shouldComponentUpdate() {
    return true;
  }

  render() {
    return (
      <div>
        <input type="text" onChange={this.onChange}/>
        <div>{this.state.s}</div>
      </div>
    );
  }
}
```
- onChangeでやっている事:
  - わざわざ`e.target.value`で値を取り出して変数vに保存してから`this.setState`を呼び出している
  - これは、`this.setState`の中で`e.target.value`を呼び出すと`TypeError: Cannot read property 'value' of null`が発生するため回避している
  - このエラーが発生してしまっている原因は、**Syntheticイベントオブジェクトであるeのtargetプロパティが、すでにnullにクリアされているため**である
  - もし、`this.setState`の中でも`e.target.value`を呼び出したいならば、`persist()`を呼ぶ必要がある
  ```js:
    onChange() {
      e.persist();
      this.setState((prevState, props) => { 
        return { s: e.target.value }
      })
    }
  ```

**Reactでフォームを扱う**
- フォームは、何らかのデータ更新等を扱うものであるため、文字を入力したり、ドロップダウンから何かを選んだり、「OK」ボタンなどを押したり、というイベント処理が基本
- データは`state`で管理する:
  - Reactでは、状態は`state`で維持する
  - 基本はコンストラクタで初期化して、適宜`setState`を呼び出して状態を更新する
  - フォームのデータも`state`で管理する
  - フォーム要素の`value`に`this.state`のフィールドを関連づける
  - `onChange`等のイベントハンドラで、setStateを呼び出して状態を更新する
  - 逆に言うと、`this.state`との関連付けの`value`はちゃんと更新しないとUIも更新されない
- `selet`と`textarea`を持つフォームの例:
```js:
import React from 'react';

export default class Form1 extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      usstate: props.initState,
      desc: 'This is for a text area.'
    }
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onTextAreaChange = this.onTextAreaChange.bind(this);
  }

  onChange(e) {
    console.log(e.target.value);
    // setState にいきなりオブジェクトを渡しているが、下記のように書くと現在の this.state に新しい値がマージされる
    this.setState({ usstate: e.target.value });
  }

  onSubmit(e){
    e.preventDefault();
    console.log("onSubmit");
    console.log(this.state);
  }

  onTextAreaChange(e){
    this.setState({ desc: e.target.value });
  }

  render() {
    var status = [
      { code: "CA", name: "California" },
      { code: "HI", name: "Hawaii" },
      { code: "TX", name: "Texas"},
      { code: "WA", name: "Washington"} 
    ];
    var options = status.map(
      (n) => (
        <option key={n.code} value={n.code}>
          {n.name}
        </option>
      )
    );
    return (
      <form onSubmit={this.onSubmit}>
        <div>
          <select
            value={this.state.usstate}
            onChange={this.onChange}>
            {options}
          </select>
          <textarea
            value={this.state.desc}
            onChange={this.onTextAreaChange} />
        </div>
        <div><button type="submit">OK</button></div>
      </form>
    );
  }
}
```
```js:
import React from 'react';
import ReactDOM from 'react-dom';
import Form1 from './Form1';

ReactDOM.render(
  <Form1 initState='Hi' />,
  document.getElementById('root')
)
```

**Google の UI ライブラリ Material Design Lite (MDL) の適用方法**
- `public/index.html`に下記の4行を追加する
```html:
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
<script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>
<link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css" />
```
- 最後の行は色合いを指定している箇所
- 次に HTML 要素にタグ付けをする
```js:
import React from 'react';

export default class Form2 extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      usstate: props.initState,
      desc: 'This is for a text area.'
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onTextAreaChange = this.onTextAreaChange.bind(this);
  }

  onChange(e){
    console.log(e.target.value);
    this.setState({ usstate: e.target.value});
  }

  onSubmit(e){
    e.preventDefault();
    console.log("onSubmit");
    console.log(this.state);
  }

  onTextAreaChange(e){
    this.setState({ desc: e.target.value });
  }

  render() {
    var states = [
      { code: "CA", name: "California" },
      { code: "HI", name: "Hawaii" },
      { code: "TX", name: "Texas"},
      { code: "WA", name: "Washington"} ];
    var options = states.map(
      (n)=>(
        <option key={n.code} value={n.code}>
          {n.name}
        </option>
      )
    );
    var formStyle = {
      padding: 20
    }
    return (
      <form onSubmit={this.onSubmit} style={formStyle}>
        <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
          <select
            className="mdl-textfield__input"
            id="select1"
            value={this.state.usstate}
            onChange={this.onChange}>
            {options}
          </select>
          <label
            className="mdl-textfield__label"
            htmlFor="select1">U.S. State</label>
        </div>
        <div>
          <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <textarea
              type="text"
              rows="3"
              id="textarea1"
              className="mdl-textfield__input"
              value={this.state.desc}
              onChange={this.onTextAreaChange}/>
            <label
              className="mdl-textfield__label"
              htmlFor="textarea1">Description</label>
          </div>
        </div>
        <div>
          <button
            className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
            type="submit">OK</button>
        </div>
      </form>
    );
  }
}
```

**イベントによるコンポーネント通信**
- Reactではコンポジットによって新しいコンポーネントを作成することが推奨されている
- 多機能のコンポーネントをひとつドンと作るより、単機能の小さいコンポーネントを作り、それぞれのコンポーネントを組み合わせて機能を増やすという考え方
- ここでは、コンポジットを構成するコンポーネント間でのカスタムイベントの実装方法を紹介
- 具体的には、**プロパティとして関数オブジェクトを受けとるようにしておき、 必要に応じてそれを呼び出すことでイベントを発行する**という考え方
- 例: MyTextBoxというコンポーネントを作成し、プロパティでメソッドを受け取れ、それを使う側がメソッドを設定したときに呼び出す
```js:
import React from 'react';

export default class MyTextBox extends React.Component {

  constructor(props) {
    super(props);
    this.state = { s: '' };
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({ s: e.target.value });
    if (this.props.onMyTextBoxChanged) {
      this.props.onMyTextBoxChanged(e.target.value);
    }
  }

  shouldComponentUpdate(nextProps, nextState) { return true; }

  render() {
    return (
      <div>
        <input
          type="text"
          value={this.state.s}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
```
- 続いて、MyTextBox を持つコンポーネント MyArea を作成する
```js:
import React from 'react';
import MyTextBox from './MyTextBox';

export default class MyArea extends React.Component {

  constructor(props){
    super(props);
    this.state = { s: "" };
    this.onMyTextBoxChanged = this.onMyTextBoxChanged.bind(this);
  }

  onMyTextBoxChanged(v){
    console.log(v);
    this.setState({s: v});
  }

  shouldComponentUpdate(nextProps, nextState){ return true; }

  render() {
    return (
      <div>
        <MyTextBox onMyTextBoxChanged={this.onMyTextBoxChanged}/>
        <div>{this.state.s}</div>
      </div>
    );
  }
}
```
- MyTextBoxのプロパティとして、`this.onMyTextBoxChanged`を渡している
- これにより、MyTextBoxは必要に応じてこのメソッドをコールバックすることができる

</details>

**srcの作成**

- 下記のディレクトリ構成を目指す
```
src
├─Actions
│ └─Actions.js
├─components
│ ├─AddUser.js
│ └─GetUser.js
├─App.js
├─Context.js
├─index.js
└─serviceWorker.js
```

**Context.js**
- ここではReactContextの初期化を行う
```js:Context.js
import React from "react"
export const AppContext = React.createContext()
export const Provider = AppContext.Provider
```

<details>
<summary>ReactContextの背景</summary>

- Reactでは、配下の**コンポーネントにデータを渡すための手段としてpropsという機能**が提供されている
- ところが、このpropsを使用すると、親コンポーネントから子コンポーネントへ、さらに孫コンポーネントへ、...、といった具合で、**渡したいコンポーネントまで渡したいデータをバケツリレーのように延々と渡していかなければならない弱点**があった（**prop drilling問題**）
- その問題を解消するべく、**どのコンポーネントからでも特定のデータにアクセスできる仕組み**がreact-reduxから提供された
- これは、Reduxを使用したことのある人なら誰もが知っている**Providerコンポーネント**のことを指す
- Providerコンポーネントとは文字通り**Providerコンポーネントでwrapした全てのコンポーネントに対して特定のデータを届けることを目的とするコンポーネント**になる
- ところがその後、Reactモジュールは、バージョンv16.3で、Reduxを差し置いてある機能を追加した...
- **react-reduxのProviderとほぼ同様の機能で同名のProviderというコンポーネントをリリース**

</details>

**Actions.js**
- ここでは、全てのCRUD操作を実行し、状態を一元管理する
```js:Actions.js

```

<details>
<summary>非同期にeventオブジェクトを参照</summary>

Reactでイベントコールバックのeventオブジェクトに非同期でアクセスしようとするとエラーが出て怒られる
```js:
// 例えば､setStateの第二引数のコールバック内でeventを参照しようとした時
function clickHandler() {
    this.setState({
        foo: 'bar'
    }, function() {
        console.log(event.target.value) // error
    })
}
```
理由
> The SyntheticEvent is pooled. 
> This means that the SyntheticEvent object will be reused and all properties will be nullified after the event callback has been invoked. 
> This is for performance reasons. As such, you cannot access the event in an asynchronous way.
- eventオブジェクトはReactによってSyntheticEventオブジェクトとしてラップされていて､パフォーマンスのために使いまわしている
- その関係で､イベントコールバックが実行され終わったら全てのプロパティをnullにするから､非同期ではアクセスできない
解決策
> If you want to access the event properties in an asynchronous way, you should call event.persist() on the event, which will remove the synthetic event from the pool and allow references to the event to be retained by user code.
- 非同期でアクセスしたかったらevent.persist()使う
- なのでイベントコールバックの中で呼んであげれば非同期でeventを参照することができる
```js:
function clickHandler(event) {
    event.persist()
    this.setState({
        foo: 'bar'
    }, function() {
        console.log(event.target.value) // OK
    })
}
```

**余談**
- setStateの挙動について気になったので余談
```js:
import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./styles.css";

class Counter extends Component {
  state = {
    count: 0
  };

  render() {
    return (
      <div>
        <h1>Count: {this.state.count}</h1>
        <button onClick={this.handleClickFunction}>Function Count up</button>
        <button onClick={this.handleClickObject}>Object Count up</button>
      </div>
    );
  }

  handleClickFunction = () => {
    this.setState(prevState => {
      return { count: prevState.count + 1 };
    });
    this.setState(prevState => {
      return { count: prevState.count + 1 };
    });
  };

  handleClickObject = () => {
    this.setState({ count: this.state.count + 1 });
    this.setState({ count: this.state.count + 1 });
  };
}

const rootElement = document.getElementById("root");
ReactDOM.render(<Counter />, rootElement);
```
- 上記のサンプルは、**setStateの引数を関数にした場合とObjectにした場合の違い**
- 引数に関数を渡した場合、カウントは２回行われている
- 引数にObjectを渡した場合、カウントは１回しか行われない
- 上記からわかるように、setState()は、引数にオブジェクトが渡された場合に、stateを即時にアップデートすることを保証しない
- Reactは、パフォーマンスを高めるため、複数のsetState（）を単一の更新にバッチするため
- そのため、1つの関数内でstateの更新を連続的に行うときは、引数に関数を渡す必要がある

</details>


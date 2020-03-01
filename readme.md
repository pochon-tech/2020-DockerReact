## React学習

- 環境

```
Host: MacBook Pro
Docker: version 19.03.5
docker-compose: version 1.25.2
```

## Work Direcrtory

- app-basic: WebpackおよびReactの基本
- app-router: React Routerの基本、記事リストの作成
- app-flux: Fluxによる開発の基本、TODOアプリの作成
  - Fluxの思想
  - Flucでの開発例
- app-redux: Reduxによる開発の基本
  - Reduxの思想
- app-redux2: Reduxによるアプリケーション作成
  - Redux-Reactの使い方
  - Named Export or Defalut Export について
- app-redux-typescript: React&Redux&TypeScript環境の立ち上げ
- react-php-project: React & PHP & Mysql の簡易的なプロジェクト例
  - Reactのおさらい（JSX〜

## Dcoker for mac

<details>
<summary>Docker for Mac を使用していて「An HTTP request took too long to complete.」が出た場合</summary>

- https://github.com/docker/compose/issues/5620
- Docker for mac事態を再起動を行うと治るらしい

```sh:
apple@appurunoMacBook-Pro react-php-project % docker-compose restart
ERROR: An HTTP request took too long to complete. Retry with --verbose to obtain debug information.
If you encounter this issue regularly because of slow network conditions, consider setting COMPOSE_HTTP_TIMEOUT to a higher value (current value: 60).
```

</details>
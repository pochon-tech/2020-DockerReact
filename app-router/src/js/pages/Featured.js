import React from "react";
import Article from "../components/Article";

export default class Featured extends React.Component {
  render() {
    /** 記事テンプレートにタイトルを渡して記事コンポーネントを作成する */
    const Articles = [
      "Some Article",
      "Some Other Article",
      "Yet Another Article",
      "Still More",
      "Some Article",
      "Some Other Article",
      "Yet Another Article",
      "Still More",
      "Some Article",
      "Some Other Article",
      "Yet Another Article",
      "Still More"
    ].map((title, i) => <Article key={i} title={title} />);

    const adText = [
      "Ad spot #1",
      "Ad spot #2",
      "Ad spot #3",
      "Ad spot #4",
      "Ad spot #5"
    ];

    // Ad spotの部分はランダムに文字列を表示する
    const randomAd = adText[Math.round(Math.random() * (adText.length - 1))];
    console.log("featured");
    return (
      <div>
        <div class="row">
          <div class="col-lg-12">
            <div class="well text-center">
              {randomAd}
            </div>
          </div>
        </div>
        <div class="row">{Articles}</div>
      </div>
    );
  }
}
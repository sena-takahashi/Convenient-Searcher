var callback = function(){
    //URL周り取得
    const nowURL = new URL(document.location);
    const paramTbm = nowURL.searchParams.get("tbm");
    console.log(nowURL);
    console.log("-----------------------------");

    //検索KWDハイライト
    const searchWords=document.querySelector("input[name='q']").value.replaceAll("　", " ").split(/\s+/);
    console.log(searchWords);
    wordHighright(searchWords);
    //console.log(document.querySelector("#res").innerText.replace(/\r?\n/g, ''));  //検索結果すべての文字
    const seapsResult=document.querySelector("#res").innerText.replace(/\r?\n/g, '');

    //検索結果に順位をつける
    const rankItems = document.body.querySelector("#res").querySelectorAll('.g');
    rankItems.forEach(function(item,index){
        item.querySelector("h3").textContent=index+1+"位:"+item.querySelector("h3").textContent
    });

    //関連キーワード上部へ移動
    const insert_element= document.getElementById("bres");
    // 複製
    const clone_element = insert_element.cloneNode(true);
    const search_element=document.getElementById("search");
    const insert_place=document.getElementById("res");
    // 指定した要素の中の末尾に挿入
    insert_place.insertBefore(clone_element, search_element);

    //検索結果形態素解析
    let arrayH3=[]
    let h3_elements = document.querySelector("#res").getElementsByTagName('h3');
    for( let i = 0; i < h3_elements.length; i++  ){
        //console.log(h3_elements[i].textContent);
        arrayH3=arrayH3.concat(DivideIntoWords(h3_elements[i].textContent));
    }
    arrayH3=toCountDict(arrayH3);
    //キーを含んだ配列に変換 オブジェクト⇒配列
    let array = Object.keys(arrayH3).map((k)=>({ key: k, value: arrayH3[k] }));
    //出現頻度順
    array.sort((a, b) => b.value - a.value);
    //ひらがなを削除と出現回数が2回以上のKWDに絞る
    const aryCheck = array.filter(value => {
        if(value.key.match(/^.[ぁ-んー]*$/)||value.value<2){
            return false;
        };
        return true;
    });
    //console.log(aryCheck);
    // ul要素を作成する
    const ListElementUl=document.createElement("ul");   // <ul></ul>
    ListElementUl.setAttribute('class', 'tanabota'); //<ul class="tanabota"></ul>
    //形態素解析の結果を表示するためにliタグとspanタグを生成してappendchildする
    for (const element of aryCheck) {
        const newLi=document.createElement("li");
        const newA=document.createElement("a");
        newA.setAttribute('class', 'tanabotaA'); 
        const newDiv=document.createElement("div");
        newDiv.textContent=element.key
        const newSpan=document.createElement("span");
        newSpan.textContent=element.value;
        newA.appendChild(newDiv);
        newA.appendChild(newSpan);
        newLi.appendChild(newA);
        ListElementUl.appendChild(newLi);
    };
    //検索結果画面にリストを表示
    insert_place.insertBefore(ListElementUl, search_element);
    document.querySelectorAll('.tanabotaA').forEach(function(cards){
        cards.addEventListener('click',function(){
            displayNone(cards.getElementsByTagName("div")[0].innerText);
        });
    });
};
  if (
      document.readyState === "complete" ||
      (document.readyState !== "loading" && !document.documentElement.doScroll)
  ) {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }

function DivideIntoWords(words){    //分かち書き
    var segmenter = new TinySegmenter();                 // インスタンス生成
    var segs = segmenter.segment(words);  // 単語の配列が返る
    console.log(segs.join(" | "));  // 表示
    return segs
}

function toCountDict(array){    //https://www.suzu6.net/posts/96-js-count-element/ 要素と要素数の連想配列を作る
    let dict = {};
    for(let key of array){
        dict[key] = array.filter(function(x){return x==key}).length;
    };
    return dict;
  };

function wordHighright(wordsList){  // 検索文字 をハイライトする (文字の背景色を変える)
    const backupOriginalA=document.body.querySelector("#res").querySelectorAll("a");
    const backupOriginalImg=document.body.querySelector("#res").querySelectorAll("img");
    for (const elem of wordsList) {
        const color = (Math.random() * 0xFFFFFF | 0).toString(16);  //カラーのランダム生成
        const randomColor = "#" + ("000000" + color).slice(-6); //https://q-az.net/random-color-code/
        const reg = new RegExp(elem, "gi"); //正規表現で文字列を検索できるようにする準備
        const $bodyText = document.body.querySelector("#res").innerHTML;    //置換したい範囲を選択
        document.body.querySelector("#res").innerHTML=$bodyText.replace(reg, "<span style='background-color:"+randomColor+"'>"+elem+"</span>"); //置換実行
    };
    var links = document.body.querySelector("#res").querySelectorAll("img");
    for (const i of links.keys()) { // 画像を正規表現で判定
        if( links[i].src.match(/style='background-color/) ) {// 文字列を正規表現で判定
            links[i].src=backupOriginalImg[i].src;   //hrefを書き換え
        };
    };
    links = document.body.querySelector("#res").querySelectorAll("a");
    for (const i of links.keys()) { // 文字列を正規表現で判定
        if( links[i].href.match(/background-color/) ) {// 文字列を正規表現で判定
            links[i].href=backupOriginalA[i].href;   //hrefを書き換え
        };
    };
}

function displayNone(text){
    const G_items = document.body.querySelector("#res").querySelectorAll('.g');
    G_items.forEach((item) => {
        if (item.textContent.indexOf(text) != -1) {    //https://qiita.com/kazu56/items/557740f398e82fc881df
            //タイトル・ディスクリプションに単語を含む場合の処理
            item.style.display = '';//空文字を値を入れて表示させる
        }else{
            item.style.display = 'none';
        };
    });
};
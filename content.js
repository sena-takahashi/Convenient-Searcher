var callback = function(){
    //URL周り取得
    let nowURL = new URL(window.location.href);
    // キーを指定し、クエリパラメータを付与、num100とnum50のurlを生成
    nowURL.searchParams.set('num', 100);
    let url_100 = nowURL.href;
    nowURL.searchParams.set('num', 50);
    let url_50 = nowURL.href;

    /*謎すぎる現象　urlsearchparamsが空なのに使える
    //https://gray-code.com/javascript/get-parameter-of-url/
    //https://gray-code.com/js_sample/url1.html?id=5&username=taro&mode=read&aid=gc39195&mode=premium&mode=testuser
    //https://googlechrome.github.io/samples/urlsearchparams/index.html
    let params = new URLSearchParams(nowURL.search.slice(1));
    console.log(params.toString());
    for (let p of params) {
      console.log(p);
    };
    params.set('num', 50);
    console.log(params.toString());
    */
    console.log("-----------------------------");

    
    //検索結果に順位をつけるのと同時に形態素解析用のリストarray_seapsを作成する
    let array_seaps=[];
    let array_dataset=[];
    const rankItems = document.body.querySelector("#res").querySelectorAll('.g');
    let index_count=1;
    rankItems.forEach(function(item,index){
        try {
            afterHTML=item.innerHTML;
            let tempdiv = document.createElement('div');
            tempdiv.innerHTML = afterHTML; //html要素に変換
            //他の人はこちらも検索を削除(style=display:noneの削除、スペースやコロンに注意)
            let remove_elements=tempdiv.querySelectorAll('div[style*="display:none"]');
            remove_elements.forEach((div) => {
                div.parentNode.removeChild(div);
            });
            //cite(titleの上にあるurlとパンクズ)を削除
            remove_elements=tempdiv.querySelectorAll('cite');
            remove_elements.forEach((div) => {
                div.parentNode.removeChild(div);
            });
            let temp_text=DivideIntoWords(tempdiv.textContent.replace(/https?:\/\//g,""));
            array_dataset.push(temp_text);
            //console.log(tempdiv.textContent.replace(/https?:\/\//g,""));
            array_seaps=array_seaps.concat(DivideIntoWords(tempdiv.textContent.replace(/https?:\/\//g,"")));
            //検索結果に順位を表示する
            item.querySelector("h3").textContent=index_count+"位:"+item.querySelector("h3").textContent
            index_count=index_count+1;
        } catch (error) {
            console.log(error);
        };
    });
    //検索KWDハイライト
    const searchWords=document.querySelector("input[name='q']").value.replaceAll("　", " ").split(/\s+/);
    console.log(searchWords);
    wordHighright(searchWords);
    //console.log(document.querySelector("#res").innerText.replace(/\r?\n/g, ''));  //検索結果すべての文字
    const seapsResult=document.querySelector("#res").innerText.replace(/\r?\n/g, '');

    //関連キーワード上部へ移動
    const insert_element= document.getElementById("bres");
    // 複製
    const clone_element = insert_element.cloneNode(true);
    const search_element=document.getElementById("search");
    const insert_place=document.getElementById("res");
    // 指定した要素の中の末尾に挿入
    insert_place.insertBefore(clone_element, search_element);
    //検索結果形態素解析
    array_seaps=toCountDict(array_seaps);
    //キーを含んだ配列に変換 オブジェクト⇒配列
    let array = Object.keys(array_seaps).map((k)=>({ key: k, value: array_seaps[k] }));
    //出現頻度順
    array.sort((a, b) => b.value - a.value);
    //ひらがな,記号を削除と出現回数が2回以上のKWDに絞る
    const aryCheck = array.filter(value => {
        if(value.key.match(/^.[ぁ-んー!"#$%&'()\*\+\-\.,\/\s›:;<=>?@\[\\\]^_`{|}~s]*$/)||value.value<3){
            return false;
        };
        return true;
    });


    //console.log(aryCheck);
    //divを作成する
    const div=document.createElement("div");   // <div></div>
    div.setAttribute('id', 'morpheme_center_col'); 

    //numを変更するためのボタンを作成
    let newA=document.createElement("a");
    newA.setAttribute('class', 'btn btn-border');
    newA.setAttribute('href', url_100);
    newA.textContent="&num=100へ変更"
    div.appendChild(newA);
    search_element.appendChild(div);

    newA=document.createElement("a");
    newA.setAttribute('class', 'btn btn-border');
    newA.setAttribute('href', url_50);
    newA.textContent="&num=50へ変更"
    div.appendChild(newA);
    search_element.appendChild(div);

    // ul要素を作成する
    const ListElementUl=document.createElement("ul");   // <ul></ul>
    ListElementUl.setAttribute('class', 'tanabota'); //<ul class="tanabota"></ul>

    //形態素解析の結果を表示するためにliタグとspanタグを生成してappendchildする
    for (const element of aryCheck) {
        //その単語を含むページが何個あるかカウント
        const newDataset = array_dataset.filter(data => data.indexOf(element.key)!== -1);
        //li,a,div,spanタグを生成する
        const newLi=document.createElement("li");
        const newA=document.createElement("a");
        newA.setAttribute('class', 'tanabotaA');
        const newDiv=document.createElement("div");
        newDiv.textContent=element.key
        const newSpan=document.createElement("span");
        newSpan.textContent=newDataset.length;
        newA.appendChild(newDiv);
        newA.appendChild(newSpan);
        newLi.appendChild(newA);
        ListElementUl.appendChild(newLi);
    };
    //ulをdivの中へ入れる
    div.appendChild(ListElementUl);
    //検索結果画面にリストを表示・・・上部LSIの下に配置したい場合
    //insert_place.insertBefore(ListElementUl, search_element);
    //検索結果のサイドカラムに表示したい場合
    search_element.appendChild(div);

    //表示を揃える center_colがなかったらright: -500px;
    const rhs = document.getElementById("rhs");
    if (rhs === null){
        // 存在しない場合の処理
        div.style.right="-430px";
        div.style.width="400px";
    };
    //クリック時のアクションを設定
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
    //console.log(segs.join(" | "));  // 表示
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
    let word_index=1;
    wordsList.forEach((elem,index,array) => {
        const color = (Math.random() * 0xFFFFFF | 0).toString(16);  //カラーのランダム生成
        const randomColor = "#" + ("000000" + color).slice(-6); //https://q-az.net/random-color-code/
        //1個   #571f3e
        //2個   #b8f70c
        //3個   #6a8758
        // switch(word_index){
        //     case 1:
        //         randomColor="#571f3e";
        //         break
        //     case 2:
        //         randomColor='#b8f70c';
        //         break
        //     case 3:
        //         randomColor="#e0ef22";
        //         break
        // };
        // word_index=word_index+1;
        // if(word_index==3){
        //     word_index=1;
        // };
        const reg = new RegExp(elem, "gi"); //正規表現で文字列を検索できるようにする準備
        const G_items = document.body.querySelector("#res").querySelectorAll('.g');
        if(!elem.match(/^([a-zA-Z0-9!-/:-@¥[-`{-~|]{0,3})$/)){
            G_items.forEach((item) => {
                if (item.textContent.indexOf(elem) != -1) {    //https://qiita.com/kazu56/items/557740f398e82fc881df
                    item.innerHTML=item.innerHTML.replace(reg, "<span style='background-color:"+randomColor+"'>"+elem+"</span>"); //置換実行
                };
            });
        };
    });


    //for (const elem of wordsList) {
        // const $bodyText = document.body.querySelector("#res").innerHTML;    //置換したい範囲を選択
        // document.body.querySelector("#res").innerHTML=$bodyText.replace(reg, "<span style='background-color:"+randomColor+"'>"+elem+"</span>"); //置換実行
    //};
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
};

function EraseUselessCode(item){
    let afterHTML=item.innerHTML;
    let tempdiv = document.createElement('div');
    tempdiv.innerHTML = afterHTML; //html要素に変換
    //他の人はこちらも検索を削除(style=display:noneの削除、スペースやコロンに注意)
    let remove_elements=tempdiv.querySelectorAll('div[style*="display:none"]');
    remove_elements.forEach((div) => {
        div.parentNode.removeChild(div);
    });
    //cite(titleの上にあるurlとパンクズ)を削除
    remove_elements=tempdiv.querySelectorAll('cite');
    remove_elements.forEach((div) => {
        div.parentNode.removeChild(div);
    });

    return tempdiv.textContent.replace(/https?:\/\//g,"");
};


//liタグがクリックされた時に検索結果にフィルタをかける
function displayNone(text){
    const G_items = document.body.querySelector("#res").querySelectorAll('.g');
    G_items.forEach((item) => {
        clean_item=EraseUselessCode(item);
        if (item.textContent.indexOf(text) != -1) {    //https://qiita.com/kazu56/items/557740f398e82fc881df
            //タイトル・ディスクリプションに単語を含む場合の処理
            item.style.display = '';//空文字を値を入れて表示させる
        }else{
            item.style.display = 'none';
        };
    });
};

/*やることメモ
・形態素解析の結果にhtmlが混じってる気がするので除外する　→ twitterのカルーセルが出ている時にfunction~~が混じってるっぽい
・liタグをクリックした時にdisplay:noneになってるテキストが混じってる気がするので除外する⇨function eraseuselesscodeを作って対応した
・
・liタグをクリックした時にクリックした文字のハイライトをする
*/
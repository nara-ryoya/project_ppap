//最初の画面のforce directed graphの描画処理
import {setStationCard, resetStationCard} from './draw_detail.js';
import { render_footer } from './render_footer.js';


//画面の大きさ
var width = parseInt(d3.select(".node_description").style("width"));
var height = 600;

//アニメーションの長さ
var extendAnimationTime = 400;

//ホバーした時の拡大比率
var extendRatio = 1.1;

//色分けのため
var color = d3.scaleOrdinal(d3.schemeCategory10);

//画面遷移したかどうか
var next_screen = false;

//なんとなくデフォルメされた位置に駅のノードを配置するためのスケーリング
var lng_scale = d3.scaleLinear().domain([139.3, 140.2]).range([0, width * 3 / 4]);
var lat_scale = d3.scaleLinear().domain([36.0, 35.3]).range([0, height]);

var font_size = 20;

//選ばれた要素に対してそれぞれ半径を当てはめるための処理
var max_radius = 1;
var min_radius = 0;
var scale_dict = {
    "昼価格": d3.scaleLinear().domain([1360, 9678]).range([min_radius, max_radius]),
    "夜価格": d3.scaleLinear().domain([2557, 13892]).range([min_radius, max_radius]),
    "昼店舗数": d3.scaleLinear().domain([232, 2985]).range([min_radius, max_radius]),
    "夜店舗数": d3.scaleLinear().domain([188, 3599]).range([min_radius, max_radius]),
    "カラオケ": d3.scaleLinear().domain([23, 46]).range([min_radius, max_radius]),
    "雀荘": d3.scaleLinear().domain([21, 36]).range([min_radius, max_radius]),
    "ダーツ": d3.scaleLinear().domain([21, 43]).range([min_radius, max_radius]),
    "水族館・動物園": d3.scaleLinear().domain([0, 25]).range([min_radius, max_radius]),
    "ボウリング": d3.scaleLinear().domain([0, 3]).range([min_radius, max_radius]),
    "映画館": d3.scaleLinear().domain([0, 11]).range([min_radius, max_radius]),
    "美術館・博物館": d3.scaleLinear().domain([0, 28785]).range([min_radius, max_radius]),
    "公園": d3.scaleLinear().domain([7, 38]).range([min_radius, max_radius]),
    "和食": d3.scaleLinear().domain([149, 473]).range([min_radius, max_radius]),
    "洋食・西洋料理": d3.scaleLinear().domain([127, 424]).range([min_radius, max_radius]),
    "中華料理": d3.scaleLinear().domain([1084, 22316]).range([min_radius, max_radius]),
    "アジア・エスニック": d3.scaleLinear().domain([36, 201]).range([min_radius, max_radius]),
    "カレー": d3.scaleLinear().domain([29, 137]).range([min_radius, max_radius]),
    "焼肉・ホルモン": d3.scaleLinear().domain([47, 232]).range([min_radius, max_radius]),
    "鍋": d3.scaleLinear().domain([22, 184]).range([min_radius, max_radius]),
    "居酒屋・ダイニングバー": d3.scaleLinear().domain([120, 292]).range([min_radius, max_radius]),
    "創作料理・無国籍料理": d3.scaleLinear().domain([22, 142]).range([min_radius, max_radius]),
    "ファミレス": d3.scaleLinear().domain([11, 39]).range([min_radius, max_radius]),
    "レストラン（その他）": d3.scaleLinear().domain([73, 277]).range([min_radius, max_radius]),
    "ラーメン": d3.scaleLinear().domain([45, 124]).range([min_radius, max_radius]),
    "カフェ・喫茶": d3.scaleLinear().domain([66, 219]).range([min_radius, max_radius]),
    "パン・スイーツ": d3.scaleLinear().domain([56, 196]).range([min_radius, max_radius]),
    "バー・お酒": d3.scaleLinear().domain([76, 342]).range([min_radius, max_radius]),
    "旅館・オーベルジュ": d3.scaleLinear().domain([2, 72]).range([min_radius, max_radius]),
}

//エリア一覧
var area_list= [];

//エリアが今表示されているかどうかの辞書
var area_is_displayed = {};

//全てチェックが外れいるかどうかの判定
var checked_element_count = 0;
var initialRadius = 10;

//要素がチェックボックスで指定されているかどうか
var selected_option = {};

//スケーリングの最大・最小を取るための変数
var tmp_max = -10000000, tmp_min = 1000000;

Promise.all([
    d3.json("./data/station_data.json"),
    d3.json("./data/station_location.json"),
    d3.json("./data/staion_area.json")
    ]
    ).then(
    (data_list)=> {
        //駅ごとのデータ、それぞれの駅の近くの遊び場のデータ
        var stationData = data_list[0];

        //駅ごとの駅のデータ
        var stationLocationData = data_list[1];

        //エリアのラベル情報
        var stationAreaData = data_list[2];

        //キーごとに格納していくもの
        var stationDataForSearch = {};
        stationData.forEach((d) => {
            d["area"] = stationAreaData[d["name"]];
            stationDataForSearch[d.name] = d;
            if (area_list.indexOf(d["area"]) == -1) area_list.push(d["area"]);
        })

        //name, area以外のキー要素
        var elements = Object.keys(stationData[0]);
        var unnecessary_element = ["name", "area", "昼価格", "夜価格", "昼店舗数", "夜店舗数"];
        elements = elements.filter(
            (element) => unnecessary_element.indexOf(element) == -1
        );
        elements = elements.slice(8);
        //選ばれた要素
        var selectedElement;// = elements[0];



        //大枠
        var node_options = d3.select(".option-card-and-station-info-card")
        .append("form").attr("class", "form")
        .append("div").attr("class", "card mt-2 w-100")
        .attr("id", "nodeOption");

        //オプションのヘッダー
        node_options
        .append("div").attr("class", "card-header")
        .append("div").attr("class", "div-card-header");

        //ヘッダーにタイトル表示
        node_options
        .select(".div-card-header").append("span")
        .attr("class", "font-weight-bold").text("食べたいもの");

        //オプションのメイン部分
        var node_option_body = node_options.append("div").attr("class", "card-body pl-3 pb-0 pt-0");


        //選んだ要素に応じて半径を変える処理
        var option3 = node_option_body.append("div").attr("class", "form-group");

        var option3_options = option3.append("div").attr("class", "row m-2");

        //各エレメントに対してチェックボックスを割り当てる(最初はどのノードもチェックしない)
        elements.forEach((element, i) => {
            var option3_i = option3_options.append("div").attr("class", "form-check col-2");
            option3_i.append("input").attr("class", "form-check-input option3_radio").attr("id", "option3_elementSelector")
            .attr("name", "flexRadioDefault option3_elementSelector").attr("type", "checkbox").attr("value", element);
            selected_option[element] = false;
            option3_i.append("label").attr("class", "form-check-label").text(element);

        });

        // forceSimulation設定
        var simulation = d3.forceSimulation()
        .force("collide",d3.forceCollide().radius(function(d) { return normalRadious(d); }))//円の半径はいじれたらいじる、とりあえず放置
        .force("charge", d3.forceManyBody())
        .force("x", d3.forceX().strength(0.2).x((d) => { return loc_x(d);}))
        .force("y", d3.forceY().strength(0.2).y((d) => { return loc_y(d);}));
        //駅の緯度経度に対してなんとなく紐づくようにsimulationを回す

        simulation
        .nodes(stationData)
        .on("tick", ticked);

        //各エレメントに対して
        d3.select("#node").selectAll(".option3_radio")
        .on("change", (event) => {
            selectedElement = event.path[0].value;

            //半径のスケーリングのための補助変数
            tmp_max = -10000000, tmp_min = 1000000;
            if (selected_option[selectedElement]) checked_element_count -= 1;
            else checked_element_count += 1;
            selected_option[selectedElement] = !selected_option[selectedElement];

            //シミュレーションを再設定(半径の変更のため)
            simulation = d3.forceSimulation()
            .force("collide",d3.forceCollide().radius(function(d) { return normalRadious(d); }))//円の半径はいじれたらいじる、とりあえず放置
            .force("charge", d3.forceManyBody())
            .force("x", d3.forceX().strength(0.2).x((d) => { return loc_x(d);}))
            .force("y", d3.forceY().strength(0.2).y((d) => { return loc_y(d)}));

            simulation
            .nodes(stationData)
            .on("tick", ticked);

            d3.select("#initialNodesSvg").selectAll(".nodeGroup")
            .select("circle")
            .transition().duration(extendAnimationTime)
            .attr("r", (d) => { return normalRadious(d);});

            //半径のスケーリングのための補助変数
            tmp_max = -10000000, tmp_min = 1000000;
        });

        //注釈
        option3.append("div").attr("class", "text-left mt-2").append("small").html(
            "※おすすめ度が大きいものほど大きく表示されます。"
        )

    //ノードを描画する領域
    var svg_option_container = d3.select(".node_description").append("div")
    .attr("class", "mt-2")
    .style("display", "flex")
    // .style("height", height+"px")
    // .style("width", width+"px")
    .style("border", "1px solid rgba(0,0,0,.125)");

    var svg_container = svg_option_container.append("div").attr("class", "position-relative")
    .style("height", height+"px")
    .style("width", "75%");

    var option_container = svg_option_container.append("div").attr("class", "p-2")
    .style("width", "25%")
    .style("border", "1px solid rgba(0,0,0,.125)");

        //駅名から検索できる部分
        var option1_wrapper = option_container
        .append("div").attr("class", "pt-3 pb-3");

        var option1 = option1_wrapper.append("div").attr("class", "form-group");
        option1.append("label").attr("class", "control-label").text("駅名から検索");
        var option1_input = option1.append("input").attr("class", "form-control").attr("type","text")
        .attr("value", "")
        .attr("id","nodeOption_form1");

        //変な駅名を入れたときに警告を出したい
        var option1_invalid = option1.append("div").attr("class", "invalid-feedback");

        var option1_button_wrapper = option1_wrapper.append("div").append("div").attr("class", "row");

        //ノードを大きくするボタン(駅を見つけるためのもの)
        option1_button_wrapper.append("button").attr("class", "btn btn-primary col-5 p-1 mx-auto").attr("type", "button")
        .attr("id", "ekimei-kensaku").text("駅名検索")
        .on("click", (event, d) => {
            var station_name = document.getElementById("nodeOption_form1").value;
            if (station_name in stationDataForSearch) {
                option1_input.classed("is-invalid", false);
                option1_invalid.text("");
                extendNode(event, stationDataForSearch[station_name]);
            }
            else{
                option1_input.classed("is-invalid", true);
                option1_invalid.text("該当する駅はありません");
            }
        }
        )

        //直接detailの方に飛ぶためのボタン
        option1_button_wrapper.append("button").attr("class", "btn btn-secondary col-5 p-1 mx-auto").attr("type", "button")
        .text("詳細表示")
        .on("click",(event, d) => {
            var station_name = document.getElementById("nodeOption_form1").value;
            if (station_name in stationDataForSearch) {
                option1_input.classed("is-invalid", false);
                option1_invalid.text("");
                selectNodeAndMoveNext(stationDataForSearch[station_name]);
            }
            else{
                option1_input.classed("is-invalid", true);
                option1_invalid.text("該当する駅はありません");
            }
        }
        )

        //地域ごとに表示するチェックボックス
        var option2 = option_container.append("div")
        .append("div").attr("class", "form-group pt-3 pb-3");
        option2.append("label").attr("class", "control-label").text("地域で指定");

        var option2_options = option2.append("div").attr("class", "row pl-5");


        //エリアに対してそれぞれチェックボックスを割り当てる
        area_list.sort();
        area_list.forEach((area) => {
            area_is_displayed[area.replace("(", "").replace(")", "")] = true;
            var option2_1 = option2_options.append("div").attr("class", "form-switch col-12 mt-1 mb-1");
            option2_1.append("input")
            .attr("class", "form-check-input").attr("id", "area-check-"+area.replace("(", "").replace(")", ""))
            .attr("type", "checkbox").attr("checked", "true")
            .style("background-color", color(area))
            .style("border-color", color(area))
            .on("change", (event) => {
                //今回変更されたチェックボックス
                var selectedArea = event.path[0].id.split("-")[2];

                //すでにチェックされていたのを消した場合
                if (area_is_displayed[selectedArea]){
                    d3.select("#initialNodesSvg").selectAll(".nodeGroup")
                    .filter((d) => {
                        return d["area"].replace("(", "").replace(")", "") == selectedArea;
                    })
                    .transition().duration(extendAnimationTime)
                    .attr("opacity", "0")
                    .transition()
                    .style("display", "none");
                    area_is_displayed[selectedArea] = false;

                    d3.select("#node").select("#area-check-"+area.replace("(", "").replace(")", ""))
                    .style("background-color", "white");
                }
                else {//チェックされていなかったのをチェックした場合
                    d3.select("#initialNodesSvg").selectAll(".nodeGroup")
                    .filter((d) => {
                        return d["area"].replace("(", "").replace(")", "") == selectedArea;
                    })
                    .transition()
                    .style("display", "block")
                    .transition().duration(extendAnimationTime)
                    .attr("opacity", "1");
                    area_is_displayed[selectedArea] = true;

                    d3.select("#node").select("#area-check-"+area.replace("(", "").replace(")", ""))
                    .style("background-color", color(selectedArea));
                }
            });
            //地域名のラベルをつける
            option2_1.append("label").attr("class", "form-check-label").text(area);
        })    

    //svgを配置
    var svg = svg_container.append("svg").attr("id", "initialNodesSvg")
    .attr("class", "h-100 w-100");

    //svg要素を配置
    var nodeGroup = d3.select("#initialNodesSvg")
    .selectAll("g")
    .data(stationData)
    .enter()
    .append("g")
    .attr("x", function(d) { return loc_x(d); })
    .attr("y", function(d) { return loc_y(d); })
    .attr("class", "nodeGroup")
    .attr("id", (d) => { return `node_${d.name}`;} )
    .call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended))
    .on("click", (event, d) => {selectNodeAndMoveNext(d); });

    nodeGroup.append("text")
    .attr("x", function(d) { return loc_x(d); })
    .attr("y", function(d) { return loc_y(d); })
    .attr("font-size", (d) => { return font_size;})
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("fill", (d, i) => { return "black";})
    .text((d) => { return d.name;})
    .append("title")
    .text("This is title.");

    nodeGroup.append("circle")
    .attr("cx", function(d) { return loc_x(d); })
    .attr("cy", function(d) { return loc_y(d); })
    .attr("r", function(d) { return normalRadious(d); })
    .attr("fill", (d, i) => { return color(d["area"]);} )
    .style("opacity", "0.3")
    .style("z-index", (d) => { return `${100 - normalRadious(d)}px`;})
    .attr("stroke", "black")
    .attr("cursor", "pointer")
    .on("mouseover", (event, d) => { if (!next_screen) {
        displayTooltip(d);
        resetExtendNode(d);
        extendNode(event, d);
    }
    })
    .on("mouseout", (event, d) => {
        if (!next_screen) deleteTooltip(); resetExtendNode(d);});

    //ツールチップ(今回は表示しないが、必要になるかも)
    var tooltip = svg_container.append("div")
    .attr("class", "mt-3 bg-light position-absolute text-center")
    .attr("id", "tooltip")
    .style("height", 50+"px")
    .style("width", 200+"px")
    .style("top", "100px")
    .style("border", "1px solid rgba(0,0,0,.125)")
    .style("opacity", "0")
    .append("span").attr("class", "text-center");

    //フッターを割り当てる(全てのタブに対して適用される)
    render_footer();


    //緯度経度に対して割り当てるための関数
    function  loc_x(d){
        var lng = stationLocationData[d.name]["lng"];
        return lng_scale(lng);
    }

    function  loc_y(d){
        var lat = stationLocationData[d.name]["lat"];
        return lat_scale(lat);
    }

    //今のところツールチップを載せないようにしている(今後必要になるかも？)
    function displayTooltip(d) {

        // var cx = svg_container.select("#node_"+d.name).select("circle").property("cx").animVal.value;
        // var cy = svg_container.select("#node_"+d.name).select("circle").property("cy").animVal.value;

        // svg_container.select("#tooltip")
        // .transition().duration(extendAnimationTime * 2)
        // .style("opacity", "1");

        // var unit;
        // if (selectedElement == "昼価格" || selectedElement == "夜価格"){
        //     unit = "円";
        // }
        // else {
        //     unit = "個";
        // }

        // svg_container.select("#tooltip")
        // .style("top", cy + "px").style("left", cx + "px")
        // .html(selectedElement + "<br>" + Math.round(d[selectedElement]) + unit);
    }

    //今のところツールチップを載せないようにしているので不要(今後必要になるかも？)
    function deleteTooltip() {
        svg_container.select("#tooltip")
        .transition().duration(extendAnimationTime * 2)
        .style("opacity", "0");
    }


    //forceSimulation 描画更新用関数
    function ticked() {
        nodeGroup.select("circle")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
        nodeGroup.select("text")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; });
    }

    //ドラッグ時のイベント関数
    function dragstarted(event, d) {
        if(!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if(!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    //諸々の関数


    function extendNode(event, d) {

        event.stopPropagation();

        // 円を大きくする
        d3.select(`#node_${d.name}`).select("circle")
        .transition().duration(extendAnimationTime)
        .attr("r", extendRatio * normalRadious(d))
        .style("stroke", "black");

        //他のノードを消す
        d3.selectAll(".nodeGroup")
        .filter((dd) => {
            return dd.name != d.name;})
        .transition().duration(extendAnimationTime)
        .attr("opacity", "0.2");

        return normalRadious(d) * extendRatio;
    }

    function resetExtendNode(d) {
        //円を戻す
        // d3.select(`#node_${d.name}`).select("circle")
        d3.select("#initialNodesSvg").selectAll(".nodeGroup").select("circle")
        .transition().duration(extendAnimationTime)
        .attr("r", (dd) => {return normalRadious(dd);})
        .style("stroke", "#666");

        //他のノードを戻す
        d3.select("#initialNodesSvg").selectAll(".nodeGroup")
        .transition().duration(extendAnimationTime)
        .attr("opacity", "1");
    }

    //半径を返す関数、normalRadious_subで返されたものをスケーリングする
    function normalRadious(d) {
        if (checked_element_count == 0) return initialRadius;
        if (tmp_max == -10000000 && tmp_min == 1000000)
        //毎回計算するのは面倒なので、初期値になっている場合のみ最大、最小を改めて計算
        {stationData.forEach((sd) => {
            tmp_max = Math.max(tmp_max, normalRadious_sub(sd));
            tmp_min = Math.min(tmp_min, normalRadious_sub(sd));
        }
        )
    };
        var scale_r = d3.scaleLinear().domain([tmp_min, tmp_max]).range([18, 70]);
        return scale_r(normalRadious_sub(d));
    }

    //スケーリング前の関数
    function normalRadious_sub(d) {

        var r = 1;
        elements.forEach((element) => {
            if (selected_option[element]) 
            {r *= scale_dict[element](d[element]);}
        })
        return r;
    }


    //クリックした後にdetailタブに移動するための関数
    function selectNodeAndMoveNext(d){

        resetExtendNode(d);

        resetStationCard();
        setStationCard(d.name, selected_option);

        $('.nav-tabs a[href="#detail"]').tab('show');
    }
    }
)


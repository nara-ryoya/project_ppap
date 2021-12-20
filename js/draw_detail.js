//このファイルにDetailタブの内容を書いていく！！

import { slide_bar, slide_bar_lunch_price, slide_bar_night_price } from "./slide_bar.js";
import { render_footer } from './render_footer.js';

//駅を選択する部分

// 駅情報

var width = parseInt(d3.select(".node_description").style("width"));
var height = 1000;

var extendAnimationTime = 200;
var extendRatio = 1.2;

var display = false;



// var colors = {
//     "カラオケ": "#1f77b4",
//     "水族館・動物園":"#ff7f0e",
//     "ボウリング": "#2ca02c",
//     "美術館・博物館": "#d62728",
//     "公園": "#bcbd22",
//     "映画館": "#e377c2",
//     "雀荘": "#7f7f7f",
//     "ダーツ": "#17becf"
// };

var font_size = 15;
let powerScale = d3.scalePow()
.exponent(2)
.domain([3, 4])
.range([10, 50]);

var delta_x;
//zoom用の変数
var max_distance = 600;
var min_max_distance = 100;
var max_max_distance = 1000;
var drag_cnt = 0;

var scale_distance = d3.scalePow().exponent(0.8).domain([0, 2000]).range([100, max_distance]);

//各エレメントが表示されているかどうかを保持する辞書
var element_is_showed = {
    "station": true,
};

var global_selectedLinks, global_selectedNodes;

var initial_pos = [
    [0, Math.random() * height]
    ,[width, Math.random() * height]
    ,[width * Math.random(), height]
    ,[width * Math.random(), height]
];


d3.json("./data/station_data.json").then( (data) => {

    //データが存在しない駅を排除するための配列
    var stationDataForSearch = [];

    data.forEach((d) => {
        stationDataForSearch.push(d.name);
    })

    var elements = Object.keys(data[0]);
    var unnecessary_element = ["name", "area", "昼価格", "夜価格", "昼店舗数", "夜店舗数"];
    elements = elements.filter(
        (element) => unnecessary_element.indexOf(element) == -1
    );
    elements = elements.slice(8);

    elements.forEach((element) => {
        element_is_showed[element] = false;
    })



    //detailタブで駅名を入力して検索するためのフォーム
    var detail_option_form = d3.select("#detail")
    .append("div").attr("class", "form-container mx-auto mt-2 bg-light row")
    .style("width", "60%").style("border", "1px solid rgba(0,0,0,.125)")
    .style("border-radius", "calc(.25rem - 1px) calc(.25rem - 1px) 0 0");

    var detail_option = detail_option_form.append("div").attr("class", "form-group mt-2 mb-2 col-4 offset-1");
    var detail_option_input = detail_option.append("input").attr("class", "form-control").attr("type","text")
    .attr("value", "")
    .attr("id","detailOption1");
    var detail_option_invalid = detail_option.append("div").attr("class", "invalid-feedback");
    var detail_option_text = detail_option_form.append("span").attr("class", "col-4 my-auto font-weight-bold")
    .text("駅の詳細情報を教示");

    //検索ボタン
    var detail_option_button_wrapper = detail_option_form.append("div").attr("class", "col-2 my-auto");
    detail_option_button_wrapper.append("button").attr("class", "btn btn-primary mx-auto")
    .attr("type", "button").text("検索")
    .on("click", (event) => {
        //検索された駅の名前
        var station_name = document.getElementById("detailOption1").value;
        if (stationDataForSearch.indexOf(station_name) != -1) {
            detail_option_input.classed("is-invalid", false);
            detail_option_invalid.text("");
            //おすすめスポットタブを変更
            resetStationCard();
            setStationCard(station_name, element_is_showed);
        }
        else{
            //データがない場合は警告文を出す
            detail_option_input.classed("is-invalid", true);
            detail_option_invalid.text("該当する駅はありません");
        }
    });

    //最初は池袋を表示(特に理由はなし)
    setStationCard("池袋", element_is_showed);
    }
)

//StationCardを消す
function resetStationCard() {
    d3.select(".station-info-form").remove();
    d3.select("#detail_node_graph").remove();
}

function setStationCard(station_selected, selected_option) {

    var colors = d3.scaleOrdinal(d3.schemeCategory10);
    var colors_idx_dict = {};
    var colors_idx = 0;

    for (var element in selected_option){
        if (element != "station") colors_idx_dict[element] = -1;
    }

    // var station_selected_wordcloud_img_path = `./img/${station_selected}_wordcloud.png`;  // 画像へのpath
    
    // // 駅情報カード
    // var station_info_card = d3.select("#detail")
    // .append("form").attr("class", "station-info-form form w-100 order-2")
    // .append("div").attr("class", "station-info-card card mt-2 w-100");

    // var station_info_card_header = station_info_card
    // .append("div").attr("class", "station-info-header card-header row");
    // station_info_card_header.append("span")
    // .attr("class", "station-info-header-text my-auto font-weight-bold col-4").text(`${station_selected}駅　駅情報`);

    // station_info_card_header.append("div").attr("class", "text-right col-2 offset-6").append("button")
    // .attr("type", "button").attr("id", "display_or_not_button").attr("class", "btn btn-secondary w-100").text("非表示")
    // .on("click", (event) => {
    //     if (display){
    //         d3.select(".selected-station-info-contents").style("display", "none");
    //         d3.select("#display_or_not_button").text("表示");
    //     }
    //     else {
    //         d3.select(".selected-station-info-contents").style("display", "flex");
    //         d3.select("#display_or_not_button").text("非表示");
    //     }

    //     display = !display;
    // })



    // var station_info_contents = station_info_card.append("div")
    // .attr("class", "selected-station-info-contents row");

    // // ワードクラウド from Twitter
    // var station_wordcloud = station_info_contents
    // .append("div").attr("class", "station-info-wordcloud card-body col-8 order-4");
    // station_wordcloud.append("p").attr("class", "station-info-wordcloud-text text-center").text("Twitter検索結果");
    // station_wordcloud.append("a").attr("href", station_selected_wordcloud_img_path)
    // .append("img").attr("class", "station-info-wordcloud-image").attr("src", station_selected_wordcloud_img_path)
    // .attr("width", "100%");

    // // 駅の利用者数 + 客層
    // var station_userdata = station_info_contents
    // .append("div").attr("class", "station-info-userdata card-body col-4 order-2");
    // station_userdata.append("p").attr("class", "station-info-userdata-text text-center").text("1日の乗降客数");
    // var pie_chart_svg = station_userdata
    // .append("div").attr("class", "text-center")
    // .append("svg").attr("class", "station-info-userdata-image").attr("width", 350).attr("height", 350)
    // .append("g").attr("transform", "translate(" + 175 + "," + 175 + ")");
    // d3.json("./data/station_customer.json").then(
    //     (data) => {
    //         draw_pie_chart(data[station_selected]["利用者数構成"], data[station_selected]["乗降客数"]);
    //     }
    // )
    
    // // 周辺スポットのデータ
    // var station_spotdata = station_info_contents
    // .append("div").attr("class", "station-info-spotdata card-body col-8 order-6");
    // station_spotdata.append("p").attr("class", "station-info-spotdata-text text-center").text("周辺スポット");
    // station_spotdata.append("img").attr("class", "station-info-spotdata-image").attr("src", "./img/kashikashika_transparent.png");

    // if (!display) d3.select(".selected-station-info-contents").style("display", "none");
    
    // // 利用者構成を表す円グラフの描画 小さすぎてテキストいらん気がする
    // // https://wizardace.com/d3-piechart/
    // function draw_pie_chart(rawdata, numusers) {
    //     var agedata = new Array(12);
    //     var jobdata = new Array(6);
    //     interpolate();
    //     var calc_rad = d3.pie().value(function(d) { return d.value; }).sort(null);
    //     var arc_outer = d3.arc().outerRadius(150).innerRadius(105);
    //     var arc_inner = d3.arc().outerRadius(105).innerRadius(60);
    //     var text_outer = d3.arc().outerRadius(135).innerRadius(135);
    //     var text_inner = d3.arc().outerRadius(90).innerRadius(90);
    
    //     pie_chart_svg.selectAll(".age-pie-chart").remove();
    //     pie_chart_svg.selectAll(".job-pie-chart").remove();
    //     pie_chart_svg.selectAll(".age-pie-chart")
    //     .data(calc_rad(agedata)).enter()
    //     .append("g").attr("class", "age-pie-chart-g")
    //     .append("path").attr("d", arc_outer).attr("fill", function(d) { return d.data.color; })
    //     .attr("opacity", 0.75).attr("stroke", "white");
    //     pie_chart_svg.selectAll(".age-pie-chart-g").append("text").attr("fill", "black")
    //     .attr("transform", function(d) { return "translate(" + text_outer.centroid(d) + ")"; })
    //     .attr("dy", "3px").attr("font-size", "10px")
    //     .attr("text-anchor", "middle")
    //     .text(function(d) { return d.data.text; });
    
    //     pie_chart_svg.selectAll(".job-pie-chart")
    //     .data(calc_rad(jobdata)).enter()
    //     .append("g").attr("class", "job-pie-chart-g")
    //     .append("path").attr("d", arc_inner).attr("fill", function(d) { return d.data.color; })
    //     .attr("opacity", 0.75).attr("stroke", "white");
    //     pie_chart_svg.selectAll(".job-pie-chart-g").append("text").attr("fill", "black")
    //     .attr("transform", function(d) { return "translate(" + text_inner.centroid(d) + ")"; })
    //     .attr("dy", "3px").attr("font-size", "10px")
    //     .attr("text-anchor", "middle")
    //     .text(function(d) { return d.data.text; });
    
    //     // なんか映らない
    //     pie_chart_svg.selectAll(".num-users")
    //     .append("g").append("text").attr("font-size", "5px").attr("text-anchor", "middle")
    //     .attr("x", 100).attr("y", 100).attr("fill", "black")
    //     .attr("dy", "5px").text(`${numusers} 人`);
    
    //     function interpolate() {
    //         ["10代", "20代", "30代", "40代", "50代", "60代以上"].forEach(
    //             (age, i) => {
    //                 agedata[i] = {
    //                     "text": age+"男性 "+rawdata["男性"]["年代別"][age]+"%",
    //                     "value": rawdata["男性"]["年代別"][age],
    //                     "color": `rgb(${100*(i+2)/8}%, ${100*(i+2)/8}%, 100%)`
    //                 };
    //                 agedata[11-i] = {
    //                     "text": age+"女性 "+rawdata["女性"]["年代別"][age]+"%",
    //                     "value": rawdata["女性"]["年代別"][age],
    //                     "color": `rgb(100%, ${100*(i+2)/8}%, ${100*(i+2)/8}%)`
    //                 };
    //             }
    //         );
    //         ["学生", "社会人", "その他"].forEach(
    //             (job, i) => {
    //                 jobdata[i] = {
    //                     "text": job+"男性 "+rawdata["男性"]["職業別"][job]+"%",
    //                     "value": rawdata["男性"]["職業別"][job],
    //                     "color": `rgb(${100*(i+2)/6}%, ${100*(i+2)/6}%, 100%)`
    //                 };
    //                 jobdata[5-i] = {
    //                     "text": job+"女性 "+rawdata["女性"]["職業別"][job]+"%",
    //                     "value": rawdata["女性"]["職業別"][job],
    //                     "color": `rgb(100%, ${100*(i+2)/6}%, ${100*(i+2)/6}%)`
    //                 };
    //             }
    //         );
    //     }
    // }


    //ドラッグ中に一部アニメーションを起こさないための変数
    var is_dragged = false;

    //チェックされている要素をカウントするための変数
    var checked_count = 0;



    for (var element in selected_option){
        element_is_showed[element] = selected_option[element];
    }


    //一番大きな枠のカード
    var station_map_card = d3.select("#detail")
    .append("div").attr("class", "card mt-2 w-100").attr("id", "detail_node_graph");

    //ヘッダーを追加
    station_map_card
    .append("div").attr("class", "station-info-header card-header")
    .append("span").attr("class", "station-info-header-text font-weight-bold").text(`${station_selected}駅周辺おすすめスポット`);

    //カードのbody(detailタブのメイン部分)
    var svg_option_container = station_map_card
    .append("div").attr("class", "card-body row")
    .style("height", height+"px");

    //svgを入れるところ
    var svg_container = svg_option_container.append("div").attr("class", "col-9");

    //svgに表示させるノードを制御するためのオプションカード
    var spot_options = svg_option_container.append("div")
    .attr("class", "col-3").attr("id", "spot_option_container")
    .style("border", "1px solid rgba(0,0,0,.125)");


    //全てを司るsvg
    var svg = svg_container.append("svg")
    .attr("class", "w-100 h-100").attr("id", "spot_svg");


    //svg要素を配置
    d3.json(`./data/details_limited/${station_selected}_details_limited.json`).then(
        (stationSpotData) => {


            var station_obj = {
                "名前": `${station_selected}`,
                "距離": 0,
                "URL": `https://www.google.co.jp/maps/place/${station_selected}駅`,
                "評価": null,
                "昼価格": null,
                "夜価格": null,
                "place_id": `${station_selected}`,
                "element_type": "station"
            };

            //全ての元となるデータ
            //最初は選ばれた駅自体のノードをつける
            var wholeStationData = [
                station_obj
            ];


            //リンクのための配列
            var connections = [];

            //最初にforceSimulationにかけるもの
            var initialSelectedNodes = [
                station_obj
            ];
            var initialSelectedLinks = [];

            //ちょっと汚いコード
            var cnt = 0;
            for (var element in stationSpotData){
                if (cnt < 8) {cnt++; continue;}
                    // オプションの追加
                var switch_wrapper = spot_options.append("div")
                .attr("class", "form-check form-switch mt-1 mb-1 ml-3");

                //switchの色をうまく表示させるためにclass名を表示させる
                var input_name = "input_" + element;

                colors_idx_dict[element] = -1;//-1で初期化

                //各エレメントに対してswitchを適用
                var switch_input = switch_wrapper.append("input")
                .attr("class", `form-check-input ${input_name}`).attr("type", "checkbox").attr("id", "input_"+element)
                .attr("cursor", "pointer");

                if (element_is_showed[element]) {
                    checked_count += 1;
                    if (colors_idx_dict[element] == -1) {
                        //もしまだ色が割り振られてなかったら割り振ってあげる
                        //これは新たにチェックを入れた場合のみに発生する
                        colors_idx_dict[element] = colors_idx;
                        console.log(colors_idx_dict);
                        colors_idx += 1;
                    }
                    switch_input.attr("checked", "true")
                    .style("background-color", colors(colors_idx_dict[element]))
                    .style("border-color", colors(colors_idx_dict[element]));
                }

                switch_input.on("change", function(event) {
                    //変えられたエレメント
                    var selectedElement = event.path[0].id.split("_")[1];

                    //もともと表示されていたものは消す
                    if (element_is_showed[selectedElement] && element != "station") {
                        d3.select("#detail").select("#input_"+selectedElement)
                        .style("background-color", "white");

                        removeSelectedElement(selectedElement);
                        element_is_showed[selectedElement] = false;

                        checked_count -= 1;


                    }
                    else {

                        if (colors_idx_dict[selectedElement] == -1 && selectedElement != "station") {
                            //もしまだ色が割り振られてなかったら割り振ってあげる
                            //これは新たにチェックを入れた場合のみに発生する
                            colors_idx_dict[selectedElement] = colors_idx;
                            colors_idx += 1;
                            console.log(colors_idx_dict);
                        }
                        d3.select("#detail").select("#input_"+selectedElement)
                        .style("background-color", colors(colors_idx_dict[selectedElement]))
                        .style("border-color", colors(colors_idx_dict[selectedElement]));

                        //もともと表示されていなかったものは表示する
                        displaySelectedElement(selectedElement);
                        element_is_showed[selectedElement] = true;

                        checked_count += 1;
                    }
                    restartSimulation();
                });

                //ラベルを当てはめる
                switch_wrapper.append("label")
                .attr("class", "form-check-label").attr("for", "input_"+element).text(element);
                // element_is_showed[element] = false;


                stationSpotData[element].slice(0, 20).forEach((_data) => {
                    _data["element_type"] = element;
                    wholeStationData.push(_data);
                    connections.push(
                        {source: name_id(wholeStationData[0]), target: name_id(_data), distance: _data["距離"]}
                    );

                    //選ばれていたら最初からforceSimulationにかける
                    if (element_is_showed[element]){
                        initialSelectedNodes.push(_data);
                        initialSelectedLinks.push(
                            {
                                source: name_id(wholeStationData[0]), target: name_id(_data), distance: _data["距離"]
                            }
                        );
                        }
                    }
                )
            }

            //svg(背景)をドラッグした際に距離を調整できるようにする

            global_selectedLinks = initialSelectedLinks.concat();
            global_selectedNodes = initialSelectedNodes.concat();

            svg
            .call(d3.drag()
            .on("start", svg_dragstarted)
            .on("drag", svg_dragged)
            .on("end", svg_dragended));

            //リンク
            var links = svg
            .selectAll("line")
            .data(connections).enter()
            .append("line")
            .attr("stroke", "lightgrey")
            .attr("stroke-width", 1);

            //ノードのg
            var nodeGroup = svg
            .selectAll("g")
            .data(wholeStationData)
            .enter()
            .append("g")
            .attr("class", "spotGroup")
            .attr("id", (d) => { return `${name_id(d)}`;} )
            .attr("display", (d) => {
                if (element_is_showed[d["element_type"]]) return "block";
                 else return "none";
            })
            .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

            //ノードのラベル
            nodeGroup.append("text")
            .attr("font-size", (d) => {
                if (d["element_type"] == "station") return font_size * 2; else return font_size;
            })
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            // .style("fill", (d) => {if (d["element_type"] == "station") return "black"; else return identifier_for_color(d);})
            .style("fill", "black")
            .html((d) => { return d["名前"];})
            .append("title")
            .text("This is title.");

            //ノードの円

            nodeGroup.append("circle")
            .attr("r", function(d) { return normalRadious(d); })
            .attr("fill", (d, i) => { return identifier_for_color(d);} )
            .style("opacity", (d) => {if (d["element_type"] == "station") return "0.3"; else return "0.3";})
            .style("z-index", (d) => { return `${100 - normalRadious(d)}`;})
            .attr("stroke", "black")
            .attr("cursor", "pointer")
            .on("mouseover", (event, d) => {
                //ドラッグ中に他のノードにうつらないように
                if (!is_dragged){
                    if (d["element_type"] != "station") displayTooltip(event, d);
                    resetExtendNode(d);
                    extendNode(event, d);
                }
            })
            .on("mouseout", (event, d) => {
                //ドラッグ中に他のノードにうつらないように
                if (!is_dragged){
                    deleteTooltip(); resetExtendNode(d);
                }
            })
            .on("click", (event, d) => {
                window.open(d["URL"], '_blank')
            });

            //シミュレーションを設定
            var simulation = return_simulation(initialSelectedNodes, initialSelectedLinks);

            //ツールチップの設定
            var tooltip = svg_container.append("div")
            .attr("class", "mt-3 bg-light position-absolute text-center")
            .attr("id", "spot_tooltip")
            .style("height", 50+"px")
            .style("width", 200+"px")
            .style("top", "100px")
            .style("border", "1px solid rgba(0,0,0,.125)")
            .style("opacity", "0")
            .style("z-index", "100")
            .append("span").attr("class", "text-center")
            .html("yei<br>aeuwhr");

            //スライドバーの設定
            spot_options.append("div").attr("class", "w-100 mt-3").attr("id", "slide-bar-container");
            slide_bar();
            slide_bar_lunch_price();
            slide_bar_night_price();

            spot_options.append("div").attr("class", "note-container text-right").append("small")
            .text("昼価格・夜価格は飲食店にのみ適用");

            //ツールチップを表示する
            function displayTooltip(event, d) {
                var cx = svg_container.select("#"+name_id(d)).select("circle").property("cx").animVal.value;
                var cy = svg_container.select("#"+name_id(d)).select("circle").property("cy").animVal.value;

                svg_container.select("#spot_tooltip")
                .transition().duration(extendAnimationTime * 2)
                .style("opacity", "1");

                svg_container.select("#spot_tooltip")
                .style("top", cy + "px").style("left", cx + "px")
                .html("駅からの距離:　" + Math.round(d["距離"]) + "m<br>" + "評価:　" + d["評価"]);
                // .html("なら");
            }
            //ツールチップを消す
            function deleteTooltip() {
                svg_container.select("#spot_tooltip")
                .transition().duration(extendAnimationTime * 2)
                .style("opacity", "0");
            }


            //forceSimulation 描画更新用関数
            function ticked() {
                nodeGroup.select("circle")
                .attr("cx", function(d) { if (d["element_type"] == "station")return width * 3 / 8; else return d.x; })
                .attr("cy", function(d) { if (d["element_type"] == "station")return height/2; else return d.y; });
                nodeGroup.select("text")
                .attr("x", function(d) { if (d["element_type"] == "station")return width * 3 / 8; else return d.x; })
                .attr("y", function(d) { if (d["element_type"] == "station")return height/2; else return d.y; });

                links
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
            }


            //ドラッグ時のイベント関数
            function dragstarted(event, d) {
                is_dragged = true;
                if(!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
                // event.stopPropagation();
            }

            function dragended(event, d) {
                is_dragged = false;
                if(!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            //svg(背景)ドラッグ時のイベント関数
            function svg_dragstarted(event) {
                delta_x = 0;
                is_dragged = true;
            }

            function svg_dragged(event) {
                max_distance += event.dx * 3;
                max_distance = Math.max(min_max_distance, max_distance);
                scale_distance = d3.scalePow().exponent(0.8).domain([0, 2000]).range([100, max_distance]);

                drag_cnt += 1;
                if (drag_cnt == 1){
                    simulation = return_simulation(global_selectedNodes, global_selectedLinks);

                    drag_cnt = 0;
                }
            }

            function svg_dragended(event) {
                // var scale_distance = d3.scalePow().exponent(0.8).domain([0, 2000]).range([60, max_distance]);
                is_dragged = false;
                // simulation.force("link")
                // .links(global_selectedLinks).distance((d) => {
                //     return scale_distance(d.distance)
                // });
                // simulation.restart();
            }

            function extendNode(event, d) {
                event.stopPropagation();
                // 円を大きくする
                svg_container.selectAll(`#${name_id(d)}`).select("circle")
                .transition().duration(extendAnimationTime)
                .attr("r", extendRatio * normalRadious(d))
                .style("stroke", "black");

                // 他のノードを消す
                svg_container.selectAll(".spotGroup")
                .filter((dd) => {
                    return dd["名前"] != d["名前"];})
                .transition().duration(extendAnimationTime)
                .attr("opacity", "0.2");

                return normalRadious(d) * extendRatio;
            }

            function resetExtendNode(d) {
                //円を戻す
                // d3.select(`#node_${d.name}`).select("circle")
                d3.selectAll(".spotGroup").selectAll("circle")
                .transition().duration(extendAnimationTime)
                .attr("r", (dd) => {return normalRadious(dd);})
                .style("stroke", "#666");

                //他のノードを戻す
                d3.selectAll(".spotGroup")
                .transition().duration(extendAnimationTime)
                .attr("opacity", "1");
            }

            //円の半径を返す
            function normalRadious(d) {
                if (d["名前"] == station_selected) return 60;
                return Math.min(Math.max(powerScale(d["評価"]), 10), 50);
            }

            //選ばれたノードを消す
            function removeSelectedElement(element) {
                d3.select("#spot_svg").selectAll("g")
                .filter((d) => {
                    return d.element_type == element;
                })
                .style("display", "none");
            }

            //選ばれたノードを表示する
            function displaySelectedElement(element) {

                d3.select("#spot_svg").selectAll("g")
                .filter((d) => {
                    return d.element_type == element;
                })
                .select("circle")
                .attr("fill", (d) => { return identifier_for_color(d);});

                d3.select("#spot_svg").selectAll("g")
                .filter((d) => {
                    return d.element_type == element;
                })
                .style("display", "block");
            }

            //idを当てるための関数
            function name_id(d){
                return `spot_${d["place_id"]}_${d["element_type"]}`;
            }

            //
            function identifier_for_color(d){
                    if (d["element_type"] == "station") return "white";
                    return colors(colors_idx_dict[d["element_type"]]);
            }

            //シミュレーションをリセットするための関数
            function restartSimulation(){
                var selectedNodes = [];
                var selectedLinks = [];
                wholeStationData.forEach((d) => {
                    if (element_is_showed[d.element_type]){
                        selectedNodes.push(d);
                        selectedLinks.push({source: name_id(wholeStationData[0]), target:name_id(d), distance: d["距離"]});
                    }
                })
                simulation = return_simulation(selectedNodes, selectedLinks);

                global_selectedLinks = selectedLinks;
                global_selectedNodes = selectedNodes;
            }

            function return_simulation(n_data, l_data){
                var tmp_sim = d3.forceSimulation()
                .nodes(n_data)
                .on("tick", ticked)
                .force("link", d3.forceLink().id(
                    (d) => { return name_id(d);}
                ))
                .force("collide",d3.forceCollide().strength(0.5).radius(function(d) { return normalRadious(d); }))//円の半径はいじれたらいじる、とりあえず放置
                .force("charge", d3.forceManyBody().strength(-100))
                .force("x", d3.forceX().strength((d) => {
                    if (d["element_type"] == "station") return 0.05;
                    else return 0.01;
                }).x(width * 3/ 8))
                .force("y", d3.forceY().strength((d) => {
                    if (d["element_type"] == "station") return 0.05;
                    else return 0.01;
                }).y(height / 2));
    
                tmp_sim.force("link")
                .links(l_data).distance((d) => {
                    return scale_distance(d.distance);
                });

                return tmp_sim;
            }
        }
    )
}

export {setStationCard, resetStationCard};


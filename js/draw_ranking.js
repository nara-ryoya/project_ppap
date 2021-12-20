import { render_footer } from './render_footer.js';

d3.json("./data/station_data.json").then( (data) => {


      //要素表示のための辞書
    const element_name = {
        "amusement_park": "アミューズメント",
        "aquarium": "水族館",
        "art_gallery": "美術館",
        "bowling_alley": "ボウリング",
        "movie_theater": "映画館",
        "museum": "博物館",
        "park": "公園",
        "tourist_attraction": "観光スポット",
        "zoo": "動物園",
    };



    var elements = Object.keys(data[0]);
    var unnecessary_element = ["name", "area", "昼価格", "夜価格", "昼店舗数", "夜店舗数"];
    elements = elements.filter(
        (element) => unnecessary_element.indexOf(element) == -1
    );
    elements = elements.slice(8);
    var initialElement = elements[0];
    var selectedElement = initialElement;



    //ランキング化する値を選ぶドロップダウン
    var ranking_option_form = d3.select("#ranking")
    .append("div").attr("class", "form-container mx-auto mt-2 bg-light row")
    .style("width", "60%").style("border", "1px solid rgba(0,0,0,.125)")
    .style("border-radius", "calc(.25rem - 1px) calc(.25rem - 1px) 0 0");

    var ranking_option = ranking_option_form
    .append("select").attr("class", "form-control w-50 mt-2 mb-2 col-4 offset-2")
    .on("change", (event) => {
        selectedElement = d3.select("#ranking").select("select").property("value");
        setRankingData(selectedElement);
        setRankingGrid();
    });

    elements.forEach((element) => {
        ranking_option.append("option").attr("value", element).text(element);
    });

    ranking_option_form.append("span").attr("class", "col-4 my-auto font-weight-bold").text("のおすすめ度ランキングを表示");

    var ranking_data = [];
    setRankingData(initialElement);


    d3.select("#ranking").append("div")
    .attr("id", "ranking-container")
    .attr("class", "text-center mt-2");

    var unit;
    if (selectedElement == "昼価格" || selectedElement == "夜価格"){
        unit = "(円)";
    }
    else {
        unit = "(個)";
    }

    new gridjs.Grid({
        columns: ["順位", "駅名", selectedElement],
        pagination: {
            limit: 20
        },
        data: ranking_data,
        style: {
            table: {
            width: "100%",
            // border: '3px solid #ccc'
            },
            th: {
                'background-color': 'rgba(0, 0, 0, 0.1)',
                color: '#000',
                // 'border-bottom': '3px solid #ccc',
                'text-align': 'center'
            },
            td: {
            'text-align': 'center'
            }
        }
    }).render(document.getElementById("ranking-container"));


    d3.selectAll(".gridjs-container").style("width", "60%");

    // render_footer();


    function setRankingData(element) {
        ranking_data = [];
        var tmp_ranking_data = [];
        data.forEach((d) => {
            var tmp = [];
            tmp.push(d.name);
            tmp.push(d[element]);
            tmp_ranking_data.push(tmp);
        });
        tmp_ranking_data.sort((a, b) => { return -a[1] + b[1];});
        // console.log(element);
        // console.log(ranking_data);
        var ranking_index = 0;
        tmp_ranking_data.forEach((d, i) => {
            if (!((i != 0) && (tmp_ranking_data[i][1] == tmp_ranking_data[i-1][1]))){
                ranking_index = i;
            }
            ranking_data.push([ranking_index + 1, d[0], d[1]]);
        })
    }
    function setRankingGrid() {
        d3.select("#ranking-container").remove();

        d3.select("#ranking").append("div")
        .attr("id", "ranking-container")
        .attr("class", "text-center mt-2");

        var unit;
        if (selectedElement == "昼価格" || selectedElement == "夜価格"){
            unit = "(円)";
        }
        else {
            unit = "(個)";
        }

        new gridjs.Grid({
            columns: ["順位", "駅名", selectedElement],
            pagination: {
                limit: 20
            },
            data: ranking_data,
            style: {
                table: {
                width: "100%",
                // border: '3px solid #ccc'
                },
                th: {
                    'background-color': 'rgba(0, 0, 0, 0.1)',
                    color: '#000',
                    // 'border-bottom': '3px solid #ccc',
                    'text-align': 'center'
                },
                td: {
                'text-align': 'center'
                }
            }
        }).render(document.getElementById("ranking-container"));
    
    
        d3.select(".gridjs-container").style("width", "60%");
        d3.select(".gridjs-container").selectAll(".gridjs-th").style("width", "33%");
    }
    }
)
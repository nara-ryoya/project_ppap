function slide_bar() {
    var slide_bar_container = d3.select("#detail").select("#slide-bar-container").append("div")
    .attr("id", "slide-bar-container");

    slide_bar_container.append("label").attr("for", "distance_range").attr("class", "form-label");
    slide_bar_container.append("input").attr("type", "range").attr("class", "form-range")
    .attr("id", "distance_range");

    // slide range
    var slide_min_distance = 100;
    var slide_max_distance = 2000;
    slide_bar_container.select(".form-range")
    .attr("min", String(slide_min_distance))
    .attr("max", String(slide_max_distance))
    .attr("step", "10")
    .attr("value", String(slide_max_distance))
    .on("input", eraseSpotNode);

    var distance_from_station = document.getElementById("distance_range").value;
    slide_bar_container.select(".form-label").append("label").attr("id", "distance_range_label")
    .text(`駅からの距離： ${distance_from_station} m以内`);
}

function slide_bar_lunch_price() {
    var slide_bar_container = d3.select("#detail").select("#slide-bar-container").append("div")
    .attr("id", "slide-bar-container-lunch-price");

    slide_bar_container.append("label").attr("for", "lunch_price_range").attr("class", "form-label");
    slide_bar_container.append("input").attr("type", "range").attr("class", "form-range")
    .attr("id", "lunch_price_range");

    // slide range
    var slide_min_distance = 1000;
    var slide_max_distance = 10000;
    slide_bar_container.select(".form-range")
    .attr("min", String(slide_min_distance))
    .attr("max", String(slide_max_distance))
    .attr("step", "10")
    .attr("value", String(slide_max_distance))
    .on("input", eraseSpotNode);

    var lunch_price = document.getElementById("lunch_price_range").value;
    slide_bar_container.select(".form-label").append("label").attr("id", "lunch_price_range_label")
    .text(`昼価格： ${lunch_price} 円以内`);
}


function slide_bar_night_price() {
    var slide_bar_container = d3.select("#detail").select("#slide-bar-container").append("div")
    .attr("id", "slide-bar-container-night-price");

    slide_bar_container.append("label").attr("for", "night_price_range").attr("class", "form-label");
    slide_bar_container.append("input").attr("type", "range").attr("class", "form-range")
    .attr("id", "night_price_range");


    var slide_min_distance = 1000;
    var slide_max_distance = 80000;

    // slide range
    let powScale = d3.scalePow()
        .exponent(2)
        .domain([0, 100])
        .range([slide_min_distance, slide_max_distance]);

    slide_bar_container.select(".form-range")
    .attr("min", String(0))
    .attr("max", String(100))
    .attr("step", "2")
    .attr("value", String(100))
    .on("input", eraseSpotNode);

    var night_price = document.getElementById("night_price_range").value;
    slide_bar_container.select(".form-label").append("label").attr("id", "night_price_range_label")
    .text(`夜価格： ${(Math.floor(powScale(night_price)) / 1000) * 1000 } 円以内`);
}



function eraseSpotNode() {
    var slide_min_distance = 1000;
    var slide_max_distance = 80000;


    let powScale = d3.scalePow()
    .exponent(2)
    .domain([0, 100])
    .range([slide_min_distance, slide_max_distance]);

    var distance_from_station = parseInt(document.getElementById("distance_range").value);
    var lunch_price = parseInt(document.getElementById("lunch_price_range").value);
    var night_price = Math.floor(powScale(parseInt(document.getElementById("night_price_range").value))/1000) * 1000;

    var nodeGroup = d3.selectAll(".spotGroup");
    nodeGroup.selectAll("text")
    .style("opacity", (d) => {
        if(d["距離"] > distance_from_station || d["昼価格"] > lunch_price || d["夜価格"] > night_price) return "0";
        else return "1";
    })
    .style("display", (d) => {
        if(d["距離"] > distance_from_station || d["昼価格"] > lunch_price || d["夜価格"] > night_price) return "none";
        else return "inline";
    });
    nodeGroup.selectAll("circle")
    .style("opacity", (d) => {
        if(d["距離"] > distance_from_station || d["昼価格"] > lunch_price || d["夜価格"] > night_price) return "0";
        else return "0.3";
    })
    .style("display", (d) => {
        if(d["距離"] > distance_from_station || d["昼価格"] > lunch_price || d["夜価格"] > night_price) return "none";
        else return "inline";
    });
    d3.select("#detail").select("#spot_option_container").select("#distance_range_label")
    .text(`駅からの距離： ${distance_from_station} m以内`);
    d3.select("#detail").select("#spot_option_container").select("#lunch_price_range_label")
    .text(`昼価格： ${lunch_price} 円以内`);
    d3.select("#detail").select("#spot_option_container").select("#night_price_range_label")
    .text(`夜価格： ${night_price} 円以内`);
}



export {slide_bar, slide_bar_lunch_price, slide_bar_night_price};

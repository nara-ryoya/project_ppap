{/* <div class="footer bg-white w-100 d-flex align-items-center text-right" style="height:150px;">
<div class="ml-5 text-center">
    <h1>PPAP</h1>
    <small> Play Planning APlication</small>
</div>
<img class="img-fluid h-50 w-auto" src="./img/kashikashika_monotone.png">
</div> */}

export const render_footer = () => {
    var footer = d3.select(".container-fluid").append("div")
    .attr("class", "footer bg-white")
    .style("height", "150px");

    var footer_wrapper = footer.append("div").attr("class", "footer bg-white d-flex align-items-center mx-auto")
    .style("height", "100%").style("width", "95%")
    .style("border-top", "1px solid rgba(0,0,0,.125)");
    var footer_contents = footer_wrapper.append("div").attr("class", "ml-5 text-center");
    footer_contents.append("h3").text("APAP");
    footer_contents.append("small").text("Appetite Pleasing APplication");

    footer_wrapper.append("div").attr("class", "h-100 d-flex align-items-center")
    .append("a").attr("href", "./index.html").attr("class", "h-50")
    .append("img").attr("class", "img-fluid h-100 w-auto").attr("src", "./img/kashikashika_monotone.png");
    var footer_ul = footer_wrapper.append("ul").attr("class", "footer-nav-container mx-auto");

    footer_ul.append("li").style("display", "inline").attr("class", "nav-item ml-5 mr-5")
    .style("list-style-type", "none").style("white-space", "nowrap")
    .append("button").attr("class", "btn").text("Station")
    .on("click", (event) => {
        $('.nav-tabs a[href="#node"]').tab('show');
    });

    footer_ul.append("li").style("display", "inline").attr("class", "nav-item ml-5 mr-5")
    .style("list-style-type", "none").style("white-space", "nowrap")
    .append("a").attr("class", "btn").text("Ranking")
    .on("click", (event) => {
        $('.nav-tabs a[href="#ranking"]').tab('show');
    });

    footer_ul.append("li").style("display", "inline").attr("class", "nav-item ml-5 mr-5")
    .style("list-style-type", "none").style("white-space", "nowrap")
    .append("a").attr("class", "btn").text("Detail")
    .on("click", (event) => {
        $('.nav-tabs a[href="#detail"]').tab('show');
    });

    footer_ul.append("li").style("display", "inline").attr("class", "nav-item ml-5 mr-5")
    .style("list-style-type", "none").style("white-space", "nowrap")
    .append("a").attr("class", "btn").text("Usage")
    .on("click", (event) => {
        $('.nav-tabs a[href="#usage"]').tab('show');
    });
}

/*
 * Renders images for each data.point
 */
function DataRenderer(canvas, data, bounds) {

    var radius = calcRadius();

    this.radius = radius;
    this.render = render;

    ////////////////////////////////////////////////////////////////////////////////////

    function render() {
        var images = canvas.selectAll("image").data(data, getId);

        images
            .call(updatePosition);

        images.enter()
            .append("image")
            .attr("class", "dot")
            .attr("xlink:href", getImage)
            .call(updatePosition)
            .on("click", function (datum) {
                window.open(datum.link);
            });

        images.exit()
            .remove();
    }

    function updatePosition(sel) {
        sel.attr("width", radius*2)
            .attr("height", radius*2)
            .attr("x", getX)
            .attr("y", getY);
    }

    function getX(datum) {
        return datum.point.x - radius;
    }

    function getY(datum) {
        return datum.point.y - radius;
    }

    function getImage(datum) {
        return datum.image;
    }

    function calcRadius() {
        var space = bounds.width * bounds.height;
        var n = Math.max(1, data.length);
        return Math.sqrt(space/(10*n))/2; // such that n images take 10% of space
    }

}
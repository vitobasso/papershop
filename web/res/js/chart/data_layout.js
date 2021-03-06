
/*
 * Controls data.point to implement:
 *   - force
 *   - collision
 *   - zoom
 */
function DataLayout(getTargetPosition) {

    var force = d3.layout.force()
        .gravity(0)
        .charge(0);

    var radius;

    this.startLayout = (data, dataRenderer) => {
        initPositions(data);
        radius = dataRenderer.radius;
        this.rearrange(data, dataRenderer)
    }

    this.rearrange = (data, dataRenderer) => {
        var points = data.map(getPoint);
        force.stop();
        force.nodes(points);
        force.on("tick", e => {
            moveTowardsTarget(data, e);
            avoidCollisions(points);
            dataRenderer.render();
        });
        force.start();
    }

    // update target position (e.g. because the axis is being zoomed) but keep displacements (distance kept to avoid collision)
    this.updateTarget = (data, dataRenderer) => {
        data.forEach(updateTarget);
        dataRenderer.render()
    }

    function moveTowardsTarget(data, e) {
        var cooling = 0.1 * e.alpha;
        data.forEach(function (d) {
            var target = getTargetPosition(d);
            d.targetPoint = target
            var point = d.point;
            point.y += (target.y - point.y) * cooling;
            point.x += (target.x - point.x) * cooling;
        });
    }

    function avoidCollisions(points) {
        var q = d3.geom.quadtree(points);
        points.forEach(point => {
            var adjustPosition = collide(point);
            q.visit(adjustPosition);
        });
    }

    function collide(node) {
        var repulsion = 0.005, //on higher value, points will pop out further to escape collision
            r = radius,
            nx1 = node.x - r,
            nx2 = node.x + r,
            ny1 = node.y - r,
            ny2 = node.y + r;
        return function (quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== node)) {
                var dx = node.x - quad.point.x,
                    dy = node.y - quad.point.y,
                    l = Math.sqrt(dx * dx + dy * dy),
                    r = 2* radius;
                if (l < r) {
                    if (l > 0) {
                        l = (l - r) / l * repulsion;
                        node.x -= dx *= l;
                        node.y -= dy *= l;
                    } else {
                        node.x += radius; //avoid division by 0 when node & quad.point coincide
                    }
                    quad.point.x += dx;
                    quad.point.y += dy;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        };
    }

    function fitNumber(value, min, max) {
        return Math.max(min, Math.min(max, value))
    }

    function getPoint(d) {
        return d.point;
    }

    function initPositions(data) {
        data.forEach(initPosition);
    }

    function initPosition(d) {
        if (!d.point) {
            d.point = getTargetPosition(d);
            d.targetPoint = d.point
            displaceRandomly(d.point); // avoid getting stuck in a vertical stack
        }
    }

    function displaceRandomly(point) {
        point.x += Math.random() * 2 * radius - radius; // between -radius and +radius
    }

    function updateTarget(d){
        var displacement = getDisplacement(d)
        var newTarget = getTargetPosition(d)
        d.point = {
            x: newTarget.x + displacement.x,
            y: newTarget.y + displacement.y
        }
        d.targetPoint = newTarget
    }

    function getDisplacement(d){
        var oldTarget = d.targetPoint
        var oldPoint = d.point
        return {
            x: oldPoint.x - oldTarget.x,
            y: oldPoint.y - oldTarget.y
        }
    }

}
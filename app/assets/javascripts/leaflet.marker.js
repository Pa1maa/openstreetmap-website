L.OSM.Marker = L.Control.extend({
    options: {
        position: "topright"
    },

    onAdd: function(map){
        const container = L.DomUtil.create("div", "leaflet-control")
        const link = L.DomUtil.create("a", "control-button", container)
        link.href = "#"
        link.title = "Mark location"
        $(L.SVG.create("svg"))
            .append($(L.SVG.create("use")).attr("href", "#icon-marker"))
            .attr("class", "h-100 w-100")
            .appendTo(link);

        let marker = null
        let placing = false

        function onMapClick(e){
            if(marker){
                marker.remove()
            }

            marker = L.marker([e.latlng.lat, e.latlng.lng], {icon: OSM.getMarker({})}).addTo(map)
            marker.bindPopup("Lat: " + e.latlng.lat.toFixed(3) + ", Lng: " + e.latlng.lng.toFixed(3)).openPopup()

            marker.on("click", ()=>{
                marker.remove()
                marker = null
            })
        }

        L.OSM._marker = () => marker

        L.DomEvent.on(link, "click", L.DomEvent.stopPropagation).on(link, "click", L.DomEvent.preventDefault).on(link, "click", ()=>{
            placing = !placing

            if(placing){
                container.classList.add("active")
                map.on("click", onMapClick)
            }
            else{
                container.classList.remove("active")
                map.off("click", onMapClick)
                if(marker){
                    marker.remove()
                    marker = null
                }
            }
        })

        return container
    }
})

L.OSM.marker = function(options){
    return new L.OSM.Marker(options)
}
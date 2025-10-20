L.OSM.AddMarkers = L.Control.extend({
    options: {
        position: "topright"
    },

    onAdd: function(map){
        const container = L.DomUtil.create("div", "leaflet-control")
        const but = L.DomUtil.create("a", "control-button", container)
        but.href = "#"
        but.title = "Mark location"
        but.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
                        </svg>`

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

        L.DomEvent.on(but, "click", L.DomEvent.stopPropagation).on(but, "click", L.DomEvent.preventDefault).on(but, "click", ()=>{
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

L.OSM.addMarker = function(options){
    return new L.OSM.AddMarkers(options)
}
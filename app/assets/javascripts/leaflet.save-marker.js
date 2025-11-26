//= require leaflet.marker

L.OSM.SaveMarker = L.Control.extend({
    options: {
        position: "topright"
    },

    onAdd: function(map){
        this._map = map
        const container = L.DomUtil.create("div", "leaflet-control")
        this._container = container

        this._csrf = document.querySelector('meta[name="csrf-token"]')?.content
        this._logged = document.querySelector('meta[name="user-signed-in"]')?.content === "true"

        this._createButton("Save marker")
        this._addDomEvents()

        return container
    },

    _createButton: function(title){
        const link = L.DomUtil.create("a", "control-button", this._container)
        link.href = "#"
        link.title = title
        $(L.SVG.create("svg"))
            .append($(L.SVG.create("use")).attr("href", "#icon-save"))
            .attr("class", "h-100 w-100")
            .appendTo(link);

        this._link = link
    },

    activate: async function(){
        const marker = this._map._marker

        if(marker){
            let name = prompt("Enter marker's name: ")
            const lat = marker.getLatLng().lat
            const lng = marker.getLatLng().lng
            
            if(this._logged){
                await fetch("/markers", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": this._csrf
                    },
                    body: JSON.stringify({ marker: { lat, lng, name: name || "Marked location" } })
                })
            }
            else{
                let markers = JSON.parse(localStorage.getItem("markers") || "[]")

                markers.push({
                    lat: marker.getLatLng().lat,
                    lng: marker.getLatLng().lng,
                    name: name || "Marked location"
                })
                localStorage.setItem("markers", JSON.stringify(markers))
            }

            marker.remove()
        }
        else{
            alert("Put a marker first!")
        }
    },

    _addDomEvents: function(){
        L.DomEvent.on(this._link, "click", async (e)=>{
            L.DomEvent.stop(e)
            await this.activate()
        })
    }
})

L.OSM.saveMarker = function(options){
    return new L.OSM.SaveMarker(options)
}
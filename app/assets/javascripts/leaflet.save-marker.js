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
        link.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-floppy-fill" viewBox="0 0 16 16">
                            <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0H3v5.5A1.5 1.5 0 0 0 4.5 7h7A1.5 1.5 0 0 0 13 5.5V0h.086a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5H14v-5.5A1.5 1.5 0 0 0 12.5 9h-9A1.5 1.5 0 0 0 2 10.5V16h-.5A1.5 1.5 0 0 1 0 14.5z"/>
                            <path d="M3 16h10v-5.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5zm9-16H4v5.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5zM9 1h2v4H9z"/>
                        </svg>`

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
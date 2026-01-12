L.OSM.SaveMarker = new class extends L.Control{
    onAdd(map){
        this._map = map
        this._container = L.DomUtil.create("div", "leaflet-control")

        this._csrf = document.querySelector('meta[name="csrf-token"]')?.content
        this._logged = document.querySelector('meta[name="user-signed-in"]')?.content === "true"

        this._createButton("Save marker", "save")
        this._addDomEvents()

        return this._container
    }

    _createButton(title, className){
        this._link = L.DomUtil.create("a", "control-button", this._container)
        this._link.href = "#"
        this._link.title = title
        $(L.SVG.create("svg"))
            .append($(L.SVG.create("use")).attr("href", `#icon-${className}`))
            .attr("class", "h-100 w-100")
            .appendTo(this._link);
    }

    async activate(){
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
            this._map._marker = null
        }
        else{
            alert("Put a marker first!")
        }
    }

    _addDomEvents(){
        L.DomEvent.on(this._link, "click", async (e)=>{
            L.DomEvent.stop(e)
            await this.activate()
        })
    }
}
L.OSM.DeleteMarkers = new class extends L.Control {
    onAdd(map){
        this._map = map
        this._container = L.DomUtil.create("div", "leaflet-control")

        this._csrf = document.querySelector('meta[name="csrf-token"]')?.content
        this._logged = document.querySelector('meta[name="user-signed-in"]')?.content === "true"

        this._active = false

        this._createButton("Delete markers", "delete")
        this._addDomEvents()

        return this._container
    }

    _createButton(title, className){
        const link = L.DomUtil.create("a", "control-button", this._container)
        link.href = "#"
        link.title = title

        $(L.SVG.create("svg"))
            .append($(L.SVG.create("use")).attr("href", `#icon-${className}`))
            .attr("class", "h-100 w-100")
            .appendTo(link);

        this._link = link
    }

    async activate(){
        if(this._active || !this._map._show) return

        this._container.classList.add("active")
        this._active = true
        await this._deleteMarkers()
    }

    deactivate(){
        if(!this._active) return

        this._container.classList.remove("active")
        this._active = false
    }

    async toggle(){
        if(this._active){
            this.deactivate()
        }
        else{
            await this.activate()
        }
    }

    _addDomEvents(){
        L.DomEvent.on(this._link, "click", async (e)=>{
            L.DomEvent.stop(e)
            await this.toggle()
        })
    }

    async _deleteMarkers(){
        let markers = []

        if(this._logged){
            const res = await fetch("/markers")
            markers = await res.json()
        }
        else{
            markers = JSON.parse(localStorage.getItem("markers") || "[]")
        }

        const control = this

        this._map._markers.forEach(marker => {
            const latlng = marker.getLatLng()

            marker.on("click", async function onDelete(){
                marker.remove()

                if(control._logged){
                    await fetch(`/markers/${marker._id}`, {
                        method: "DELETE",
                        headers: {
                            "X-CSRF-Token": control._csrf
                        }
                    })
                }
                else{
                    for(j = 0; j < markers.length; j++){
                        if(latlng.lat === markers[j].lat && latlng.lng === markers[j].lng){
                            markers.splice(j, 1)
                            break
                        }
                    }
                    localStorage.setItem("markers", JSON.stringify(markers))
                }
                control._map._markers = control._map._markers.filter(m => m !== marker)

                marker.off("click", onDelete)
            })
        })
    }
}
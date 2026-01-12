L.OSM.SavedMarkers = new class extends L.Control {
    onAdd(map){
        this._map = map
        this._container = L.DomUtil.create("div", "leaflet-control")

        this._csrf = document.querySelector('meta[name="csrf-token"]')?.content
        this._logged = document.querySelector('meta[name="user-signed-in"]')?.content === "true"

        this._active = false
        this._markerArr = []

        this._createButton("Show saved markers", "saved")
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
        if(this._active) return

        this._active = true
        this._container.classList.add("active")
        await this._addMarkers()
    }

    deactivate(){
        if(!this._active) return

        this._active = false
        this._container.classList.remove("active")
        this._removeMarkers()
    }

    toggle(){
        if(this._active){
            this.deactivate()
        }
        else{
            this.activate()
        }
    }

    _addDomEvents(){
        L.DomEvent.on(this._link, "click", (e)=>{
            L.DomEvent.stop(e)
            this.toggle()
            this._map._show = this._active
        })
    }

    async _addMarkers(){
        let markers = []

        if(this._logged){
            const res = await fetch("/markers")
            markers = await res.json()
        }
        else{
            markers = JSON.parse(localStorage.getItem("markers") || "[]")
        }

        for(let i = 0; i < markers.length; i++){
            const marker = L.marker([markers[i].lat, markers[i].lng], { icon: OSM.getMarker({}) }).addTo(this._map)
            marker.bindPopup(markers[i].name, { autoClose: false, closeOnClick: false }).openPopup()
            marker._id = markers[i].id || Date.now() + i
            this._markerArr.push(marker)
        }

        this._map._markers = this._markerArr
    }

    _removeMarkers(){
        for(let i = 0; i < this._markerArr.length; i++){
            this._markerArr[i].remove()
        }
        this._markerArr = []
    }
}
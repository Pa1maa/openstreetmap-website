//require leaflet.saved-markers

L.OSM.Marker = new class extends L.Control{
    onAdd(map){
        this._map = map
        this._container = L.DomUtil.create("div", "leaflet-control")

        this._marker = null
        this._active = false

        this._createButton("Add marker", "marker")
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

    activate(){
        if(this._active) return

        this._active = true
        this._map.on("click", this._onMapClick, this)
        this._container.classList.add("active")
        L.OSM.SavedMarkers.reset()
    }

    deactivate(){
        if(!this._active) return
        
        this._active = false
        this._map.off("click", this._onMapClick, this)
        this._container.classList.remove("active")
        this._marker?.remove()
    }

    toggle(){
        if(!this._active){
            this.activate()
        }
        else{
            this.deactivate()
        }
    }

    reset(){
        this.deactivate()
    }

    _addDomEvents(){
        L.DomEvent.on(this._link, "click", (e)=>{
            L.DomEvent.stop(e)
            this.toggle()
        })
    }

    async _onMapClick(e){
        if(this._marker){
            this._marker.remove()
        }

        this._marker = L.marker([e.latlng.lat, e.latlng.lng], {icon: OSM.getMarker({})}).addTo(this._map)
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${e.latlng.lat}&lon=${e.latlng.lng}&accept-language=en`
        const response = await fetch(url, {
            "Accept": "application/json",
            "User-Agent": "osm-learning-app (local development)"
        })
        const data = await response.json()
        const address = data.display_name || "Lat: " + e.latlng.lat + ", Lon: " + e.latlng.lng

        this._marker.bindPopup(address, { closeButton: false, closeOnEscapeKey: false }).openPopup()

        this._map._marker = this._marker

        this._marker.off("click")
        this._marker.on("click", ()=>{
            this._marker.remove()
            this._marker = null
        })
    }
}
L.OSM.Marker = L.Control.extend({
    options: {
        position: "topright"
    },
    
    onAdd: function(map){
        this._map = map
        const container = L.DomUtil.create("div", "leaflet-control")
        
        this._container = container
        this._marker = null
        this._active = false

        this._createButton("Add marker", "marker")
        this._addDomEvents()

        return container
    },

    _createButton: function(title, className){
        const link = L.DomUtil.create("a", "control-button", this._container)
        link.href = "#"
        link.title = title

        $(L.SVG.create("svg"))
            .append($(L.SVG.create("use")).attr("href", `#icon-${className}`))
            .attr("class", "h-100 w-100")
            .appendTo(link);

        this._link = link
    },

    activate: function(){
        if(this._active) return

        this._active = true
        this._map.on("click", this._onMapClick, this)
        this._container.classList.add("active")
    },
    
    deactivate: function(){
        if(!this._active) return
        
        this._active = false
        this._map.off("click", this._onMapClick, this)
        this._container.classList.remove("active")
        this._marker?.remove()
    },

    toggle: function(){
        if(!this._active){
            this.activate()
        }
        else{
            this.deactivate()
        }
    },

    _addDomEvents: function(){
        L.DomEvent.on(this._link, "click", (e)=>{
            L.DomEvent.stop(e)
            this.toggle()
        })
    },

    _onMapClick: function(e){
        if(this._marker){
            this._marker.remove()
        }

        this._marker = L.marker([e.latlng.lat, e.latlng.lng], {icon: OSM.getMarker({})}).addTo(this._map)
        this._marker.bindPopup("Lat: " + e.latlng.lat.toFixed(3) + ", Lng: " + e.latlng.lng.toFixed(3), { closeButton: false, closeOnEscapeKey: false }).openPopup()

        this._map._marker = this._marker

        this._marker.off("click")
        this._marker.on("click", ()=>{
            this._marker.remove()
            this._marker = null
        })
    }
})

L.OSM.marker = function(options){
    return new L.OSM.Marker(options)
}
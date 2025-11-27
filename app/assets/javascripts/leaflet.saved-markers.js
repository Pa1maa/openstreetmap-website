L.OSM.SavedMarkers = L.Control.extend({
    options: {
        position: "topright"
    },

    onAdd: function(map){
        this._map = map
        const container = L.DomUtil.create("div", "leaflet-control")
        this._container = container

        this._csrf = document.querySelector('meta[name="csrf-token"]')?.content
        this._logged = document.querySelector('meta[name="user-signed-in"]')?.content === "true"

        this._active = false
        this._markerArr = []

        this._createButton("Show saved markers")
        this._addDomEvents()

        return container
    },

    _createButton: function(title){
        const link = L.DomUtil.create("a", "control-button", this._container)
        link.href = "#"
        link.title = title
        
        $(L.SVG.create("svg"))
            .append($(L.SVG.create("use")).attr("href", "#icon-saved"))
            .attr("class", "h-100 w-100")
            .appendTo(link);

        this._link = link
    },

    activate: async function(){
        if(this._active) return

        this._active = true
        this._container.classList.add("active")
        await this._addMarkers()
    },

    deactivate: function(){
        if(!this._active) return

        this._active = false
        this._container.classList.remove("active")
        this._removeMarkers()
    },

    toggle(){
        if(this._active){
            this.deactivate()
        }
        else{
            this.activate()
        }
    },

    _addDomEvents: function(){
        L.DomEvent.on(this._link, "click", (e)=>{
            L.DomEvent.stop(e)
            this.toggle()
            this._map._show = this._active
        })
    },

    _addMarkers: async function(){
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
    },

    _removeMarkers: function(){
        for(let i = 0; i < this._markerArr.length; i++){
            this._markerArr[i].remove()
        }
        this._markerArr = []
    }
})

L.OSM.savedMarkers = function(options){
    return new L.OSM.SavedMarkers(options)
}
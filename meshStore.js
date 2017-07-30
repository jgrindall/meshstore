

var MeshStore = function(scene){
    this.scene = scene;
    this.clear();
};

MeshStore.prototype.clear = function(){
    this.data = {};
};

MeshStore.prototype.setupFromJSON = function(json){
    var i, j;
    this.cache();
    this.clear();
    for(i = 0; i < 3; i++){
        for(j = 0; j < 3; j++){
            this.add(i, j, json[i][j]);
        }
    }
};

MeshStore.prototype.actionDiff = function(key, diff){
    var scene = this.scene;
    _.each(diff.move, function(moveObj){
        var mesh = scene.getMeshByID(moveObj.from.id);
        if(mesh){
            mesh.position = new BABYLON.Vector3(moveObj.to.position[0] * 2, moveObj.to.position[1] * 2, 0);
            mesh.id = moveObj.to.id;
            mesh.name = moveObj.to.id;
        }
        else{
            throw ("mesh not found", key);
        }
    });
    _.each(diff.add, function(addObj){
        var mesh = window.mesh.createInstance(addObj.id);
        mesh.position = new BABYLON.Vector3(addObj.position[0] * 2, addObj.position[1] * 2, 0);
    });
    _.each(diff.remove, function(removeObj){
        var mesh = scene.getMeshByID(removeObj.id);
        if(mesh){
            mesh.dispose();
        }
        else{
            throw ("mesh not found", key);
        }
    });
};

MeshStore.prototype.getDiffForKey = function(from, to){
    var i, minLength, actions = {
        add:[
        ],
        remove:[
        ],
        move:[
        ]
    };
    from = from || [];
    minLength = Math.min(from.length, to.length);
    i = from.length - 1;
    while(from.length - actions.remove.length > to.length){
        actions.remove.push({
            "id":from[i].id
        });
        i--;
    }
    for(i = 0; i < minLength; i++){
        if(!equals(to[i], from[i])){
            actions.move.push({
                "to":to[i],
                "from":from[i]
            });
        }
    }
    i = minLength;
    while(from.length + actions.add.length < to.length){
        actions.add.push(to[i]);
        i++;
    }
    return actions;
};

MeshStore.prototype.buildForKey = function(key){
    this.actionDiff(key, this.getDiffForKey(this._cache[key], this.data[key]));
};

MeshStore.prototype.cache = function(){
    this._cache = JSON.parse(JSON.stringify(this.data));
};

MeshStore.prototype.uncache = function(){
    this._cache = null;
};

MeshStore.prototype.build = function(){
    _.each(_.keys(this.data), this.buildForKey.bind(this));
};

MeshStore.prototype.addForKey = function(key, obj) {
    this.data[key] = this.data[key] || [];
};

MeshStore.prototype.add = function(i, j, obj){
    var data;
    if(obj.type === "empty"){
        return;
    }
    this.data[obj.type] = this.data[obj.type] || [];
    data = this.data[obj.type];
    _.each(["n", "s", "w", "e"], function(dir){
        if(obj.walls[dir]){
            data.push({
                "position":[i, j],
                "direction":dir,
                "id":obj.type + "_" + Math.floor(Math.random()*100000000)
            });
        } 
    });
};

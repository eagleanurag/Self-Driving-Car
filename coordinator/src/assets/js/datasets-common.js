function getImageCountFromDataset(datasetType, dataset) {
    return new Promise(function(resolve, reject){
        let data = JSON.stringify({'dataset_type':datasetType,'dataset': dataset});
        $.post('/image-count-from-dataset', data, function(result){
            resolve(result.image_count);
        });
    });
}

function getDateFromDataset(dataset) {
    return new Promise(function(resolve, reject){
        let data = JSON.stringify({'dataset': dataset});
        $.post('/dataset-date-from-dataset-name', data, function(result){
            resolve(result.dataset_date);
        });
    });
}

function getDatasetIdFromDataset(dataset) {
    return new Promise(function(resolve, reject){
        let data = JSON.stringify({'dataset': dataset})
        $.post('/dataset-id-from-dataset-name', data, function(result){
            resolve(result.dataset_id);
        });
    });
}

function getDatasetMetadata(datasetType, dataset) {
    const apiResults = [
        getDatasetIdFromDataset(dataset),
        getDateFromDataset(dataset),
        getImageCountFromDataset(datasetType, dataset),
        Promise.resolve(dataset),
        getImageCountFromDataset('mistake', dataset)
    ]
    return Promise.all(apiResults).then(function(apiResults){
        const result = {
                'id' : apiResults[0],
                'date' : apiResults[1],
                'images' : apiResults[2],
                'name' : apiResults[3],
                'flags' : apiResults[4]
        }
        return result
    });
}

function loadDatasetMetadata(dataset_type) {
    return new Promise(function(resolveLoad, reject) {
        $.get( "/list-"+dataset_type+"-datasets").then(function(response){
            return response.datasets;
        }).then(function(datasets){
            let allMetadata = datasets.map(function (dataset) {
                return new Promise(function (resolve) {
                  resolve(getDatasetMetadata(dataset_type,dataset));
                });
            });
            Promise.all(allMetadata).then(function() {
                resolveLoad(allMetadata);
            });
        });
    });
}

function loadDatasetMetadataFileSystem() {
    return new Promise(function(resolveLoad, reject) {
        $.get( "/list-datasets-filesystem").then(function(response){
            return response.datasets;
        }).then(function(datasets){
            let allMetadata = datasets.map(function (dataset) {
                return new Promise(function (resolve) {
                  resolve(getDatasetMetadata("review",dataset));
                });
            });
            Promise.all(allMetadata).then(function() {
                resolveLoad(allMetadata);
            });
        });
    });
}

function refreshRecordReader() {
    return new Promise(function(resolve, reject){
        $.post('/refresh-record-reader', function(result){
            resolve(result);
        });
    });
}

function showVideo(){
    removeVideoSafely();
    const videoImageContainer = document.querySelector('div#video-image-container');
    const videoImage = new Image();
    videoImage.src = "/video";
    videoImage.setAttribute("id","drive-mpeg-image");
    videoImageContainer.appendChild(videoImage);
    return videoImage
}

/*
I use this function in the Pi page to pass host to
the editor.py script so that I can run local tests
similarly to how run tests on the real Pi. The
original showVideo function doesn't accept a header
parameter to contain the host
*/
function showLiveVideo(args){
    const host = args.host
    const port = args.port
    removeVideoSafely();
    const videoImageContainer = document.querySelector('div#video-image-container');
    const videoImage = new Image();
    const videoUrl = '/video?host='+host+'&port='+port;
    videoImage.src = videoUrl;
    videoImage.setAttribute("id","drive-mpeg-image");
    videoImageContainer.appendChild(videoImage);
    return videoImage
}

function removeVideoSafely(){
    if (document.contains(document.getElementById("drive-mpeg-image"))) {
        document.querySelector("#drive-mpeg-image").remove();
    }
}

function showDriveButtonsRow(){
    const driveButtonsRow = document.querySelector('div#driveButtonsRow');
    driveButtonsRow.style.display = 'flex';
}

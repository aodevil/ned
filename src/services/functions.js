export const componentDidMountDelay = (that,callback=null,delay=350)=>{
    setTimeout(() => {
        that.setState({
            mounted:true
        },callback);
    }, delay);
} 

export const replaceDiacritics = (value="")=>{
    let a = ["á","é","í","ó","ú","ä","ë","ï","ö","ü","à","è","ì","ò","ù","â","ê","î","ô","û","ñ"];
    let b = ["a","e","i","o","u","a","e","i","o","u","a","e","i","o","u","a","e","i","o","u","n"];
    value = value.toLowerCase();
    for(i=0; i< a.length; i++){
       value = value.replace(a[i],b[i]);
    }
    return value.trim();
}

export const rawStr = (value = "")=>{
    const v = value || '';
    return replaceDiacritics(v.toString()).replace(/\s/gi,"");
}

export const cleanPhoneNumber = (number)=>{
    return number.replace(/[^\d]/g, '');
}

export const dayNameWithIndex = (i)=>{
    let day = "";
    switch(i){
        case 0:
            day = "Lunes";
            break;
        case 1:
            day = "Martes";
            break;
        case 2:
            day = "Miércoles";
            break;
        case 3:
            day = "Jueves";
            break;
        case 4:
            day = "Viernes";
            break;
        case 5:
            day = "Sábado";
            break;
        case 6:
            day = "Domingo";
            break;
        default:
            break;
    }
    return day;
}

export const monthNameWithIndex = (i = 0)=>{
    const months = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
    ];
    return months[i];
}

export const shortDateString = (date, fullMonth = false) => {
    let d = date || new Date();
    let day = d.getDate();
    if(day < 10)day = `0${day}`;
    let month = d.getMonth() + 1;
    if(month < 10)month = `0${month}`;
    let year = d.getFullYear();
    if (fullMonth)
        return `${day} de ${monthNameWithIndex(d.getMonth())} de ${year}`;
    else 
        return `${day}/${month}/${year}`;
}

/** @param str only accepts yyyy-mm-dd format */
export const stringToDate = (data)=>{
    let date = null;
    if(typeof data === "string"){
        let str = data;
        if(str){
            let arr = str.split(/\W|T/);
            if(arr.length >= 3){
                date = new Date(arr[0],arr[1]-1,arr[2]);
            }
        }
    } else if (typeof data === 'number') {
        date = new Date(data);
    }
    else if(data instanceof Date){
        date = data;
    }
    
    return date || new Date();
}

export const compareValues = (value, other)=> {

	// Get the value type
	var type = Object.prototype.toString.call(value);

	// If the two objects are not the same type, return false
	if (type !== Object.prototype.toString.call(other)) return false;

	// If items are not an object or array, return false
	if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

	// Compare the length of the length of the two items
	var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
	var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
	if (valueLen !== otherLen) return false;

	// Compare two items
	var compare = function (item1, item2) {

		// Get the object type
		var itemType = Object.prototype.toString.call(item1);

		// If an object or array, compare recursively
		if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
			if (!compareValues(item1, item2)) return false;
		}

		// Otherwise, do a simple comparison
		else {

			// If the two items are not the same type, return false
			if (itemType !== Object.prototype.toString.call(item2)) return false;

			// Else if it's a function, convert to a string and compare
			// Otherwise, just compare
			if (itemType === '[object Function]') {
				if (item1.toString() !== item2.toString()) return false;
			} else {
				if (item1 !== item2) return false;
			}

		}
	};

	// Compare properties
	if (type === '[object Array]') {
		for (var i = 0; i < valueLen; i++) {
			if (compare(value[i], other[i]) === false) return false;
		}
	} else {
		for (var key in value) {
			if (value.hasOwnProperty(key)) {
				if (compare(value[key], other[key]) === false) return false;
			}
		}
	}

	// If nothing failed, return true
	return true;

};

export const scrollIsNearToBottom = (nativeEvent,offset=20)=>{
    try {
        let {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
        return (layoutMeasurement.height + contentOffset.y) >= (contentSize.height - offset);
    } catch (error) {
        return false;
    }
}

export const scrollTo = (scroll, target, offset = 0, timeout = 150) => {
    if(scroll){
        if (target && target.nativeEvent) {
            const { nativeEvent: { layout } } = target;
            const y = layout.y + offset;
            setTimeout(() => {
                scroll.scrollTo({x:0, y, animated: true});
            }, timeout);
            
        } else {
            setTimeout(() => {
                scroll.scrollToEnd({animated:true});
            }, timeout);
        }
    }
}
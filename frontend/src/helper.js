import {NotificationManager} from 'react-notifications';

class HelperClass {

    concatParams(params = {}) {
        let retString = ""
        let keys = Object.keys(params);
        for (let i = 0; i < keys.length; i++) {
            if (i === 0) // init
                retString = "?"
            else
                retString += "&"
            retString += encodeURIComponent(keys[i]) + "=" + encodeURIComponent(params[keys[i]])
        }
        return retString
    }

    bytesToSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

        /**
     * Cookies
     */
    setCookie(name, value, days = 365) {
        let expires = "";
        if (days) {
            let date = new Date();
            date.setDate(date.getDate() + days);
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/;";
    }

    getCookie(name) {
        let nameEQ = name + "=";
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    eraseCookie(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
    }

    getJWTToken()
    {
        return localStorage.getItem("auth_token")
    }

    fireErrorToast(title, content, delay=5000)
    {
        NotificationManager.error(content, title, delay, null);
    }

    fireWarningToast(title, content, delay=5000)
    {
        NotificationManager.warning(content, title, delay, null);
    }

    fireInfoToast(title, content, delay=5000)
    {
        NotificationManager.info(content, title, delay, null);
    }

    fireSuccessToast(title, content,delay=5000)
    {
        NotificationManager.success(content, title, delay, null);
    }

}

const Helper = new HelperClass();
export default Helper;
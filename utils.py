from flask import jsonify

def success_response(data=None, message="Success"):
    """Restituisce una risposta di successo standardizzata"""
    response = {
        "status": "success",
        "message": message
    }
    if data is not None:
        response["data"] = data
    return jsonify(response)

def error_response(message="Error", status_code=400):
    """Restituisce una risposta di errore standardizzata"""
    response = {
        "status": "error",
        "message": message
    }
    return jsonify(response), status_code

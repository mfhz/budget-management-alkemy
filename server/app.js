/* Express */
const express = require('express');
const server = express();
/* JWT */
const jwt = require('jsonwebtoken');
const signing = 'mafhz';
/* DB Connection */
const { db_host, db_name, db_user, db_password, db_port } = require("./conexion.js");
const Sequelize = require('sequelize');
const sequelize = new Sequelize(`mysql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}`);
const { QueryTypes } = require("sequelize");
/* Middleware */
const bodyParser = require('body-parser');
/* CSP Seguridad */
const helmet = require('helmet');

/* Server Setup */
server.use(helmet());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.listen(3000, () => {
    console.log('Servivor Inicializado');
})

/* Cors */
const cors = require("cors");
server.use(cors());


////------- USUARIOS -------\\\\


/**** Endpoint al hacer login entrega token  ****/
server.get("/budget/v1/users/login", async (req, res) => {
    const { email, pass } = req.query;
    console.log(email);
    console.log(pass);
	try {
        const emailBD = await getDataBD("users", "mail", email);
        if (email && pass) {
            if (emailBD.disabled) {
                res.status(401).send("La cuenta está deshabilitada");
            } else if (emailBD.password === pass) {
                const token = generateToken({
                    user: emailBD.mail,
                    id: emailBD.user_id,
                    isAdmin: emailBD.admin,
                    isDisabled: emailBD.disabled,
                });
                console.log('OK');
                const verification = jwt.verify(token, signing);
                const userBD = await getDataBD("users", "user_id", verification.id);
                // console.log(userBD)
                const isDisabled = userBD.disabled;
                if (isDisabled) {
                    res.status(401).send("Acceso denegado, la cuenta está deshabilitada");
                } else {
                    console.log(verification);
                }
                res.status(200).json({token: token, userId: verification.id});
            } else {
                res.status(400).send("Correo o contraseña incorrectos");
                console.log("Correo o contraseña incorrectos");
            }
        } else {
            res.status(400).send("Se debe ingresar correo y contraseña");
            console.log("Se debe ingresar correo y contraseña");
        }
		
	} catch (error) {
		res.status(500).send("Ah ocurrido un error...." + error);
	}
});


/**** Endpoint para: traer todos los usuarios registrados solo por el administrador o si es usuario normal el detalle de la cuenta ****/
server.get("/budget/v1/users", validateToken, async (req, res) => {
    const admin = req.tokenInfo.isAdmin;
    const userId = req.tokenInfo.id;
    try {
        let filterUser = [];
        if (admin) {
            const userBD = await getDataBD("users", true, true, true);
            filterUser = userBD.map((account) => {
                delete account.password;
                return account;
            });
        } else {
            const userBD = await getDataBD("users", "user_id", userId, true);
            filterUser = userBD.map((account) => {
                delete account.password;
                delete account.admin;
                delete account.disabled;
                delete account.user_id;
                return account;
            });
        }
    
        if (filterUser.length > 0) {
            res.status(200).json(filterUser);
        } else { 
            res.status(404).json("El usuario ingresado no existe");
        }
    } catch (error) {
        res.status(500).send("Ah ocurrido un error...." + error);
    }
});
 

/**** Endpoint para el registro de usuarios ****/
server.post("/budget/v1/users", async (req, res) => {
	const { name, lastname, email, pass, repeatPass } = req.body;	
	try {
		const emailBD = await getDataBD("users", "mail", email);            
        if (emailBD) {
            res.status(409).json("El correo ingresado ya existe");
            return;
        }
        if ((name && lastname && email && pass && repeatPass)) {
            if (pass === repeatPass) {
                const updateBD = await sequelize.query(
                    "INSERT INTO users (name, lastname, mail, password) VALUES (:name, :lastname, :email, :pass)",
                    { replacements: { name, lastname, email, pass } }
                );
                res.status(200).json("Usuario creado correctamente");
            } else {
                res.status(409).json("Las contraseñas deben coincidir");
            }
        } else {
            res.status(400).send("Todos los campos son necesarios para registrarse");
        }
	} catch (error) {
		res.status(500).send("Ah ocurrido un error...." + error);
	}
});


/**** Endpoint para actualizar informacion del usuario logueado ****/
server.put("/budget/v1/users", validateToken, async (req, res) => {
    const token = req.tokenInfo;
    const userToken = token.user;
    try {
        const userBD = await getDataBD("users", "mail", userToken);
        const userId = userBD.user_id;
        if (userBD) {
            const { name, lastname, password } = req.query;
            if (name || lastname || password) {
                const userFilter = filterProps({ name, lastname, password });
                const updateUser = { ...userBD, ...userFilter };
                console.log(updateUser);
                const updateBD = await sequelize.query(
                    "UPDATE users SET name = :updateName, lastname = :updateLastName, password = :updatePassword WHERE user_id = :userId",
                    {
                        replacements: {
                            updateName: updateUser.name,
                            updateLastName: updateUser.lastname,
                            updatePassword: updateUser.password,
                            userId: userId,
                        },
                    }
                );
                console.log('Usuario actualizado correctamente"')
                res.status(200).json("Usuario actualizado correctamente");
            } else {
                console.log('Debe haber por lo menos un campo para actualizar')
                res.status(400).send("Debe haber por lo menos un campo para actualizar");
            }
        } else {
            console.log('El usuario ingresado no existe')
            res.status(404).json("El usuario ingresado no existe");
        }
    } catch (error) {
        res.status(500).send("Ah ocurrido un error...." + error);
    }
});
 

/**** Endpoint para buscar usuarios en especifico (Solo Administrador) ****/
server.get("/budget/v1/users/:useremail", validateToken, async (req, res) => {
    const admin = req.tokenInfo.isAdmin;
	const userEmail = req.params.useremail;
	try {
		if (admin) {
            const userBD = await getDataBD("users", "mail", userEmail);
		    if (userBD) {
		    	res.status(200).json(userBD);
		    } else {
		    	res.status(404).json("El usuario ingresado no existe");
		    }
        } else {
            res.status(401).json("Acceso denegado, la cuenta debe ser administrador");
        }
	} catch (error) {
		res.status(500).send("Ah ocurrido un error...." + error);
	}
});

 
/**** Endpoint para actualizar usuario en especifico (Solo Administrador) ****/
server.put("/budget/v1/users/:useremail", validateToken, async (req, res) => {
    const userEmail = req.params.useremail;
    const admin = req.tokenInfo.isAdmin;
	try {
        if (admin) {
            const { name, lastname, password, admin, disabled } = req.body;
            if (name || lastname || password || admin || disabled) {
                const emailBD = await getDataBD("users", "mail", userEmail);
                const userId = emailBD.user_id;
                console.log(emailBD);
                if (!emailBD) {
                    res.status(404).json("El usuario ingresado no existe");
                    return;
                }
                const emailFilter = filterProps({ name, lastname, password, admin, disabled });
                const updateUser = { ...emailBD, ...emailFilter };
                console.log(updateUser);
                const update = await sequelize.query(
                    `UPDATE users SET name = :name, lastname = :lastname, password = :pass, admin = :isAdmin, disabled = :isDisabled WHERE user_id = :userId`,
                    {
                        replacements: {
                            name: updateUser.name,
                            lastname: updateUser.lastname,
                            pass: updateUser.password,
                            isAdmin: updateUser.admin,
                            isDisabled: updateUser.disabled,
                            userId: userId,
                        },
                    }
                );
                res.status(200).send(`El usuario con correo ${emailBD.mail} fue actualizado correctamente`);
            } else {
                res.status(400).send("Debe haber por lo menos un campo para actualizar");
            }
        } else {
            res.status(401).json("Acceso denegado, la cuenta debe ser administrador");
        }
	} catch (error) {
		res.status(500).send("Ah ocurrido un error...." + error);
	}
});


/**** Endpoint para eliminar un usuario en específico (Solo Administrador) ****/
server.delete("/budget/v1/users/:useremail", validateToken, async (req, res) => {
    const userEmail = req.params.useremail;
    const admin = req.tokenInfo.isAdmin;
	try {
		if (admin) {
            const emailBD = await getDataBD("users", "mail", userEmail);
            const userId = emailBD.user_id;
            if (!emailBD) {
                res.status(404).json("El usuario ingresado no existe");
                return;
            }
            const update = await sequelize.query("UPDATE users SET disabled = true WHERE user_id = :userId", {
                replacements: {
                    userId: userId,
                },
            });
            res.status(200).send(`El usuario con correo ${userEmail} se encuentra deshabilitado`);
        } else {
            res.status(401).json("Acceso denegado, la cuenta debe ser administrador");
        }
	} catch (error) {
		res.status(500).send("Ah ocurrido un error...." + error);
	}
});



////------- MOVIMIENTOS INGRESOS Y EGRESOS -------\\\\


/**** Endpoint para traer todos los movimientos registrados solo por el administrador o si es usuario normal los movimientos que tenga ****/
server.get("/budget/v1/accounting", validateToken, async (req, res) => {
    const admin = req.tokenInfo.isAdmin;
    const userId = req.tokenInfo.id;
    let array = [];
    try {
        let filteraccounting = [];
        if (admin) {
            const accountingTypeBD = await getDataBD("accounting", true, true, true);
            filteraccounting = accountingTypeBD.map((account) => {
                return account;
            });
        } else {
            const accountingTypeBD = await getDataBD("accounting", "user_id", userId, true);
            // filteraccounting = accountingTypeBD.map((account) => {
            //     delete account.disabled;
            //     return account;
            // });
            filteraccounting = accountingTypeBD.map((account) => {
                if (account.disabled != 1) {
                    delete account.disabled;
                    array.push(account);
                    return array;
                }
            });
        }
        res.status(200).json(array);

    } catch (error) {
        res.status(500).send("Ah ocurrido un error...." + error);
    }
});
 

/**** Endpoint para crear registro de movimientos ****/
server.post("/budget/v1/accounting", validateToken, async (req, res) => {    
    const userId = req.tokenInfo.id;
    const { concept, price, action} = req.query;
    try {
        if (concept && price && action) {
            const register = await sequelize.query(
                "INSERT INTO accounting (concept, price, date, action_id, user_id) VALUES (:concept, :price, :date, :action, :userId)",
                { replacements: { concept, price, date: new Date(), action, userId } }
            );

            const actionTable = await getDataBD("actions", "action_id", action, true);
            

            console.log(`el ${actionTable[0].name} fue creada con éxito`);
            res.status(200).json(`El ${actionTable[0].name} ha sido generada correctamente`);
        } else {
            res.status(400).send('Se debe ingresar todos los campos para crear el registro')
        }
    } catch (error) {
        res.status(500).send("Ah ocurrido un error...." + error);
    }
});
 

/**** Endpoint para buscar un ingreso o egreso registrado por su ID ****/
server.get("/budget/v1/accounting/:id", validateToken, async (req, res) => {
    const accountingID = req.params.id;
    const admin = req.tokenInfo.isAdmin;
	try {
		if (admin) {
            const accountingRegistered = await sequelize.query("SELECT * FROM accounting WHERE accounting_id = :id;", {
                replacements: { id: accountingID },
                type: QueryTypes.SELECT,
            });
            if (accountingRegistered.length > 0) {                
                res.status(200).json(accountingRegistered);
            } else {
                res.status(404).send(`El registro con ID ${accountingID} no existe`);
            }
        } else {
            res.status(401).json("Acceso denegado, la cuenta debe ser administrador");
        }
	} catch (error) {
		res.status(500).send("Ah ocurrido un error...." + error);
	}
});


/**** Endpoint para actualizar el valor del ingreso o egreso registrado por su ID ****/
server.put("/budget/v1/accounting/:id", validateToken, async (req, res) => {
    const accountingID = req.params.id;
    console.log('ACAAAAA');
    console.log(accountingID);
    const { concept, price } = req.query;
    console.log(price);
    try {
        const accountingRegistered = await sequelize.query("SELECT * FROM accounting WHERE accounting_id = :id;", {
            replacements: { id: accountingID },
            type: QueryTypes.SELECT,
        });
        
        if (accountingRegistered.length > 0) {
            if (concept || price) {
                const updateBD = await sequelize.query(
                    "UPDATE accounting SET concept = :description, price = :cash WHERE accounting_id = :id",
                    {
                        replacements: {
                            description: concept,
                            cash: price,
                            id: accountingID,
                        },
                    }
                );
                const actionTable = await getDataBD("actions", "action_id", accountingRegistered[0].action_id, true);
                console.log(`El ${actionTable[0].name} ha sido actualizado correctamente`)
                res.status(200).json(`El ${actionTable[0].name} ha sido actualizado correctamente`);
            } else {
                res.status(400).send('Se debe ingresar al menos un parametro para actualizar el registro');
            }
        } else {
            res.status(404).send(`El registro con ID ${accountingID} no existe`);            
        }
    } catch (error) {
        res.status(500).send("Ah ocurrido un error...." + error);
    }
});


/**** Endpoint para eliminar los registros por su ID ****/
server.delete("/budget/v1/accounting/:id", validateToken, async (req, res) => {
    const accountingID = req.params.id;
	try {
		const accountingTypeBD = await getDataBD("accounting", "accounting_id", accountingID, true);
        if (accountingTypeBD) {
            const update = await sequelize.query("UPDATE accounting SET disabled = true WHERE accounting_id = :id", {
                replacements: {
                    id: accountingID,
                },
            });
            console.log(`El registro con ID ${accountingID} se deshabilitó correctamente`)
            res.status(200).json(`El registro con ID ${accountingID} se deshabilitó correctamente`);
        } else {
            res.status(404).send(`El registro con ID ${accountingID} no existe`);
        }
	} catch (error) {
		res.status(500).send("Ah ocurrido un error...." + error);
	}
});



////------- TIPO DE MOVIMIENTOS (INGRESO Y EGRESO) -------\\\\


/**** Endpoint para obtener todas las acciones (Solo Administrador) ****/
server.get("/budget/v1/actions/", validateToken, async (req, res) => {
    const admin = req.tokenInfo.isAdmin;
    try {
        if (admin) {
            const getActions = await getDataBD('actions', true, true, true);
            if (getActions.length > 0) {
                res.status(200).json({data: getActions});
            } else {
                res.status(404).send("No hay tipo de movimientos creados");
            }
        } else {
            res.status(401).json("Acceso denegado, la cuenta debe ser administrador");
        }
    } catch (error) {
        res.status(500).send("Ah ocurrido un error...." + error);
    }
})


/**** Endpoint para crear un tipo de movimiento (Solo Administrador) ****/
server.post("/budget/v1/actions/", validateToken, async (req, res) => {
    const admin = req.tokenInfo.isAdmin;
    const { name } = req.body;	
    try {
        if (admin) {            
            const nameActionBD = await getDataBD("actions", "name", name);
            if (nameActionBD) {
                res.status(409).json("El nombre ingresado ya existe, por favor intente con otro");
                return;
            }
            if (name ) {
                const updateBD = await sequelize.query(
                    "INSERT INTO actions (name) VALUES (:name)",
                    { replacements: { name } }
                );
                res.status(200).json(`El tipo de movimiento "${name}" fue creado correctamente`);
            } else {
                res.status(400).send("Es necesario del parametro para crear el tipo de movimiento");
            }
        } else {
            res.status(401).json("Acceso denegado, la cuenta debe ser administrador");
        }
    } catch (error) {
        res.status(500).send("Ah ocurrido un error...." + error);
    }
})


/**** Endpoint para buscar un tipo de movimiento en especifico (Solo Administrador) ****/
server.get("/budget/v1/actions/:name", validateToken, async (req, res) => {
    const admin = req.tokenInfo.isAdmin;
	const nameAction = req.params.name;
	try {
		if (admin) {
            const actionBD = await getDataBD("actions", "name", nameAction);
		    if (actionBD) {
		    	res.status(200).json({data: actionBD});
		    } else {
		    	res.status(404).json("El nombre ingresado no existe");
		    }
        } else {
            res.status(401).json("Acceso denegado, la cuenta debe ser administrador");
        }
	} catch (error) {
		res.status(500).send("Ah ocurrido un error...." + error);
	}
});


/**** Endpoint para actualizar un tipo de movimiento en especifico (Solo Administrador) ****/
server.put("/budget/v1/actions/:name", validateToken, async (req, res) => {
    const admin = req.tokenInfo.isAdmin;
	const nameAction = req.params.name;
	try {
		if (admin) {
            const actionBD = await getDataBD("actions", "name", nameAction);
            const actionId = actionBD.action_id;
		    if (actionBD) {
                const { name, disabled } = req.body;
                if (name || disabled) {
                    const actionFilter = filterProps({ name, disabled });
                    const updateAction = { ...actionBD, ...actionFilter };
                    console.log(updateAction);
                    const updateBD = await sequelize.query (
                        "UPDATE actions SET name = :nameUpdate, disabled = :isDisabled WHERE action_id = :actionId",
                        {
                            replacements: {
                                nameUpdate: updateAction.name,
                                isDisabled: updateAction.disabled,
                                actionId: actionId,
                            },
                        }
                    );
                    res.status(200).json(`El tipo de movimiento con ID ${actionId} ha sido actualizado correctamente`);
                } else {
                    res.status(400).json("Debe haber por lo menos un parametro para actualizar un tipo de movimiento");
                }		    	
		    } else {
		    	res.status(404).json("El nombre ingresado no existe");
		    }
        } else {
            res.status(401).json("Acceso denegado, la cuenta debe ser administrador");
        }
	} catch (error) {
		res.status(500).send("Ah ocurrido un error...." + error);
	}
});


/**** Endpoint para eliminar un tipo de movimiento en especifico (Solo Administrador) ****/
server.delete("/budget/v1/actions/:name", validateToken, async (req, res) => {
    admin = req.tokenInfo.isAdmin;
    const nameAction = req.params.name;
    if (admin) {
        const actionBD = await getDataBD("actions", "name", nameAction);
        const actionId = actionBD.action_id;
        if (actionBD) {
            const updateBD = await sequelize.query(`UPDATE actions set disabled = true WHERE action_id = :actionId`, {
                replacements: {
                    actionId: actionId,
                },
            });
            res.status(200).json(`El tipo de movimiento "${nameAction}" ha sido eliminado correctamente`);
        } else {
            res.status(404).json("El nombre ingresado no existe");
        }
    } else {
        res.status(401).json("Acceso denegado, la cuenta debe ser administrador");
    }
});







////------- FUNCIONES -------\\\\


/**** Función donde se genera el Token ****/
function generateToken(data) {
	return jwt.sign(data, signing, { expiresIn: "20m" });
}


/**** Función donde consula a la BD ****/
async function getDataBD(tabla, tablaParametros = 'TRUE', input = 'TRUE', completo = false) {
    // console.log('BASE DE DATOS');
    const results = await sequelize.query(`SELECT * FROM ${tabla} WHERE ${tablaParametros} = :replacementParam`, {
		replacements: { replacementParam: input },
		type: QueryTypes.SELECT,
    });
    // console.log(results);
	return results.length > 0 ? (completo ? results :  results[0]) : [];
}


/**** Funcion donde verifica si un objeto tiene campos nulos o indefinidos y los que tienen valor los guarda en un nuevo objeto****/
function filterProps(obj) {
    Object.keys(obj).forEach((key) => !obj[key] && delete obj[key]);
	return obj;
}


////------- MIDDLEWARE -------\\\\


/**** Middleware para validar la firma del Token ****/
async function validateToken(req, res, next) {
	const tokenData = req.headers.authorization.split(" ")[1];
	try {
        const verification = jwt.verify(tokenData, signing);
		console.log('TOKEN')
		console.log(verification);
		const userBD = await getDataBD("users", "user_id", verification.id);
        const isDisabled = userBD.disabled;
		if (isDisabled) {
			res.status(401).json("Acceso denegado, la cuenta está deshabilitada");
		} else {
			req.tokenInfo = verification;
			next();
		}
	} catch (e) {
		res.status(401).json("El token es invalido");
	}
}
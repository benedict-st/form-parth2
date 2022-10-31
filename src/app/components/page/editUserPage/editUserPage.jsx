import React, { useEffect, useState } from "react";

import PropTypes from "prop-types";
import api from "../../../api";
import TextField from "../../common/form/textField";
import SelectField from "../../common/form/selectField";
import RadioField from "../../common/form/radioField";
import MultiSelectField from "../../common/form/multiSelectField";
import { useParams, useHistory } from "react-router-dom";

export default function EditUserPage() {
    const params = useParams();
    const { userId } = params;
    const [users, setUser] = useState();
    const history = useHistory();
    useEffect(() => {
        api.users.getById(userId).then((user) => {
            setUser(user);
        });
    }, []);

    const [data, setData] = useState({
        name: "",
        email: "",
        profession: "",
        sex: "",
        qualities: []
    });

    const [qualities, setQualities] = useState([]);
    const [professions, setProfession] = useState([]);

    useEffect(() => {
        api.professions.fetchAll().then((data) => {
            const professionsList = Object.keys(data).map((professionName) => ({
                label: data[professionName].name,
                value: data[professionName]._id
            }));
            setProfession(professionsList);
        });
        api.qualities.fetchAll().then((data) => {
            const qualitiesList = Object.keys(data).map((optionName) => ({
                value: data[optionName]._id,
                label: data[optionName].name,
                color: data[optionName].color
            }));
            setQualities(qualitiesList);
        });
    }, []);

    const getProfessionById = (id) => {
        for (const prof of professions) {
            if (prof.value === id) {
                return { _id: prof.value, name: prof.label };
            }
        }
    };
    const getQualities = (elements) => {
        const qualitiesArray = [];
        for (const elem of elements) {
            for (const quality in qualities) {
                if (String(elem.value) === qualities[quality].value) {
                    qualitiesArray.push({
                        _id: qualities[quality].value,
                        name: qualities[quality].label,
                        color: qualities[quality].color
                    });
                }
            }
        }
        return qualitiesArray;
    };

    const handleChange = (target) => {
        setData((prevState) => ({
            ...prevState,
            [target.name]: target.value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {};
        const qualitiesData = [];
        let elementqualities = {};
        for (let i = 0; i < e.target.length; i++) {
            if (e.target.elements[i].getAttribute("name") != null) {
                formData[e.target.elements[i].getAttribute("name")] =
                    e.target.elements[i].value;
                if (e.target.elements[i].getAttribute("name") === "qualities") {
                    elementqualities = { value: [e.target.elements[i].value] };
                    qualitiesData.push(elementqualities);
                }
            }
        }

        formData.qualities = qualitiesData;

        const { profession, qualities } = formData;
        const formDataNew = {
            ...formData,
            profession: getProfessionById(profession),
            qualities: getQualities(qualities)
        };

        api.users.update(userId, formDataNew).then((data) => setUser(data));

        history.push(`/users/${userId}`);
    };
    if (users) {
        return (
            <div className="container mt-5">
                <div className="row">
                    <div className="col-md-6 offset-md-3 shadow p-4">
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Имя"
                                name="name"
                                value={data.name}
                                defaultValue={users.name}
                                onChange={handleChange}
                                type="text"
                            />
                            <TextField
                                label="Электронная почта"
                                name="email"
                                value={data.email}
                                defaultValue={users.email}
                                onChange={handleChange}
                            />
                            <SelectField
                                label="Выбери свою профессию"
                                defaultOption="Choose..."
                                options={professions}
                                name="profession"
                                onChange={handleChange}
                                value={data.profession}
                                defaultValue={users.profession}
                            />
                            <RadioField
                                options={[
                                    { name: "Male", value: "male" },
                                    { name: "Female", value: "female" },
                                    { name: "Other", value: "other" }
                                ]}
                                value={data.sex}
                                defaultChecked={users.sex}
                                name="sex"
                                onChange={handleChange}
                                label="Выберите ваш пол"
                            />
                            <MultiSelectField
                                options={qualities}
                                onChange={handleChange}
                                value={data.qualities}
                                defaultValue={users.qualities}
                                name="qualities"
                                label="Выберите ваши качества"
                            />

                            <button
                                className="btn btn-primary w-100 mx-auto"
                                type="submit"
                            >
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    } else {
        return <h1>Loading</h1>;
    }
}

EditUserPage.propTypes = {
    userId: PropTypes.string
};

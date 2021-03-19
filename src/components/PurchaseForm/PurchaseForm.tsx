import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import {BuyStatus, FriendListItem, Purchase, UserInfoWithCheckbox} from '../../data/types';
import { CurrentUserContext } from '../Context';
import { USERS } from '../../data/api/data';
import './PurchaseForm.css'

interface PurchaseFormProps {
    value: Purchase;
    onChange: (value: Purchase) => void;
    buyStatus?: BuyStatus;
}

const PurchaseForm = ({value, buyStatus, onChange}: PurchaseFormProps) => {

    const gameRestrictions = value.game.restrictions;

    const currentUser = useContext(CurrentUserContext);
    const userFriends = useMemo(() => currentUser!.friendIds?.map(id => USERS.find(item => item.id === id)), []);

    const inputEmailRef = useRef<HTMLInputElement>(null);

    const [showEmailFields, setShowEmailFields] = useState(false);
    const [invitedFriendsList, setInvitedFriendsList] = useState<any[]>([]);
    const [listBuyers, setListBuyers] = useState<any[]>(
        userFriends 
            ?   userFriends.concat(currentUser).map(item => ({...item, checkbox: 0}))
            :   [{...currentUser, checkbox: 0}]
    );
    
    const setCheckbox = (id: number, checkbox: number) => {
        setListBuyers(listBuyers?.map((item: UserInfoWithCheckbox) => item.id === id ? {...item, checkbox: checkbox} : item));
    }

    const addListBuyersItem = (id: number, age: number) => {
        if(listBuyers.find(item => item.id === id).checkbox !== 0) setCheckbox(id, 0);
        else if(gameRestrictions?.minAge) {
            if(age !== -1) {
                gameRestrictions.minAge <= age ? setCheckbox(id, 1) : setCheckbox(id, 3);
            } else setCheckbox(id, 2)
        }
        else setCheckbox(id, 1);
    }

    const addInvitedFriendsList = () => {
        setInvitedFriendsList(prev => [...prev, {id: Date.now(), email: inputEmailRef.current?.value}]);
        setTimeout(() => inputEmailRef.current!.value = '', 0);
    }

    const removeInvitedFriendsList = (friendId: number) => {
        setInvitedFriendsList(invitedFriendsList.filter(item => item.id !== friendId));
    }

    const showMessage = (checkbox: number) => (
        checkbox === 2 
            ?   '*Cannot be selected unless user`s age is specified, because the game has age restriction*'
            :   "*The person is not allowed to get the game due to age restriction*"
    )

    useEffect(() => {
        if(invitedFriendsList.length > 0) onChange({...value, emails: invitedFriendsList.map(item => item.email)});
    }, [invitedFriendsList])

    useEffect(() => {
        if(listBuyers.length > 0) 
        onChange({
            ...value, 
            userIds: listBuyers?.filter((item: UserInfoWithCheckbox) => item.checkbox === 1).map(item => item.id)})
    }, [listBuyers])

    return (
        <div>
            <ul className = 'purchase-form__list'>
                {listBuyers
                    ?.sort((prev, next) => prev.name < next.name ? -1 : 1)
                    .sort(prev => prev.id === currentUser!.id ? -1 : 1)
                    .map((item, index) => 
                        <li key = {item.id} onClick = {() => addListBuyersItem(item.id, item.age || -1)}>
                            <span>{index === 0 ? '*(me)*' : item.name}</span>
                            <input type = 'checkbox' readOnly checked = {item.checkbox === 1}/> 
                            {item.checkbox !== 1 && item.checkbox !== 0 && <p className = 'purchase-form__list-validation'>{showMessage(item.checkbox)}</p>}
                        </li>
                )}            
            </ul>
            <div onClick = {() => setShowEmailFields(!showEmailFields)} className = 'purchase-form__invitation-checkbox'>
                <span>*Invite friends*</span>
                <input type="checkbox" checked = {showEmailFields} readOnly/>
            </div>
            {showEmailFields &&
                <>
                    <div className = 'purchase-form__invitation-typing'>
                        <input type = "email" placeholder = 'Email' ref = {inputEmailRef} onKeyDown = {(e:React.KeyboardEvent<HTMLInputElement>) => e.keyCode === 13 ? addInvitedFriendsList() : null}/>
                        <button onClick = {addInvitedFriendsList}>Добавить</button>
                    </div>
                    <ul className = 'purchase-form__invitation-list'>
                            {invitedFriendsList.map((item: FriendListItem) => <li key = {item.id}>
                                <span>{item.email}</span>
                                <span onClick = {() => removeInvitedFriendsList(item.id)}>&#215;</span>
                            </li>)}
                    </ul>
                    <div className = 'purchase-form__invitation-rules'>
                        <label>
                            <span>*I acknowledge that Game Market invitation emails will be sent to specified emails. The game will become available to the person only onсe the registration in the Game Market is completed.*</span>
                            <input 
                                type="checkbox" 
                                onChange = {(e:React.ChangeEvent<HTMLInputElement>) => onChange({...value, acknowledgeInvite: e.target.checked})}
                                required
                            />
                        </label>
                        {gameRestrictions &&
                            <label>
                                <span>*I acknowledge that the game has age restriction and might be unavailable if a person is under required age.*</span>
                                <input 
                                    type="checkbox" 
                                    onChange = {(e:React.ChangeEvent<HTMLInputElement>) => onChange({...value, acknowledgeInviteAge: e.target.checked})}
                                    required
                                />
                            </label>
                        }
                    </div>
                </>
            }
        </div>
    )
}

export default PurchaseForm
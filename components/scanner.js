import { useState, useEffect } from 'react'
import { startScan, stopScan } from '../services/scanner'
import useLocalStorageState from 'use-local-storage-state'
import { useBodyCompositionContext } from '../contexts/bodycomposition.context';
import { useNotificationsContext } from '../contexts/notifications.context';

var myCharacteristic;


export default function Scanner() {

    const { bodyComposition, setBodyComposition } = useBodyCompositionContext();
    const { notification, setNotification } = useNotificationsContext();
    const [scanning, setScanning] = useState(false);
    const [errorMessage, setSerrorMessage] = useState('');
    const [age, setAge] = useLocalStorageState('age', {
        defaultValue: 25
    });
    const [height, setHeight] = useLocalStorageState('height', {
        defaultValue: 180
    });
    const [gender, setGender] = useLocalStorageState('gender', {
        defaultValue: 'male'
    });

    async function onStartButtonClick() {
        await startScan({ age, height, gender, setBodyComposition, setScanning, setNotification, setSerrorMessage, notification });
    }

    async function onStopButtonClick() {
        setNotification({
            ...notification,
            scanning: false,
            status: 'Stopped'
        });
        await stopScan({ setScanning, setSerrorMessage });
    }

    return (

        <div>
            <div>
                <label className="block">
                    <span className="text-gray-700">Age</span>
                    <input
                        type="number"
                        name="age"
                        min={0}
                        value={age}
                        onChange={e => setAge(e.target.value)}
                        className="
                mt-1
                block
                w-full
                rounded-md
                border-gray-300
                shadow-sm
                focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
              "
                        placeholder=""
                    />
                </label>
                <label className="block">
                    <span className="text-gray-700">Height (cm)</span>
                    <input
                        type="number"
                        name="height"
                        min={0}
                        value={height}
                        onChange={e => setHeight(e.target.value)}
                        className="
            mt-1
            block
            w-full
            rounded-md
            border-gray-300
            shadow-sm
            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
          "
                        placeholder=""
                    />
                </label>

                <label className="block">
                    <span className="text-gray-700">Gender</span>
                    <select
                        name="gender"
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        className="
                    block
                    w-full
                    mt-1
                    rounded-md
                    border-gray-300
                    shadow-sm
                    focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                  "
                    >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                    </select>
                </label>
            </div>
            <div className='flex flex-wrap'>
                <button
                    onClick={onStartButtonClick}
                    className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5 ml-auto'
                > Start Scan
                </button>

            </div>
            {
                errorMessage && <div>Error occured, try again. Message: {errorMessage}</div>
            }

            {
                scanning && <div>

                    <div className='fixed inset-0 flex items-center z-50  w-full p-5 overflow-x-hidden overflow-y-auto max-h-full '>
                        <div className='relative w-full max-w-2xl max-h-full '>
                            <div role="status" className="ml-auto mr-auto p-6 space-y-6 relative bg-black rounded-lg shadow dark:bg-gray-700 ">
                                <svg aria-hidden="true" className="ml-auto mr-auto w-8 h-8  text-gray-200 animate-spin fill-blue-600 mb-5" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                </svg>
                                <div className='text-white text-center'>Scanning. Waiting for impedance</div>
                                <div className='text-white text-center'>{notification.status}</div>
                                <div className='mx-auto w-fit'>
                                    <button
                                        onClick={onStopButtonClick}
                                        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2'
                                    > Stop Scan
                                    </button>
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            }

        </div>
    )
}

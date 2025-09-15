import React from 'react'
import NewCasesTable from './NewCasesTable'
import UpcomingAppointmentsTable from './UpcomingAppointmentsTable'
import ReportsSubmitTable from './ReportsSubmitTable'

const HomeTables = () => {
    return (
        <div className='flex flex-col gap-4'>
            <h1 className='text-black text-[36px] font-semibold'>
                Welcome,
                <span className='text-[#00A8FF]'>
                    Dr Sarah!
                </span>
            </h1>
            <NewCasesTable />
            <UpcomingAppointmentsTable />
            <ReportsSubmitTable />
        </div>
    )
}

export default HomeTables
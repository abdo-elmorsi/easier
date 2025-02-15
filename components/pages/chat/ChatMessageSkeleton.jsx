import React from 'react'

function ChatMessageSkeleton() {
	return (
		<div className="animate-pulse flex flex-col gap-4">
			{[...Array(4)].map((_, i) => (
				<div
					key={i}
					className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
				>
					<div className={`h-20 w-3/4 md:w-1/2 ${i % 2 === 0
						? 'bg-gray-200 dark:bg-gray-700 rounded-r-lg rounded-tl-lg mr-auto ltr:mr-auto ltr:ml-0'
						: 'bg-blue-100 dark:bg-primary rounded-l-lg rounded-tr-lg rtl:ml-auto rtl:mr-0'
						}`}>
						<div className="p-3 space-y-2">
							<div className={`h-4 w-1/4 ${i % 2 === 0
								? 'bg-gray-300 dark:bg-gray-600'
								: 'bg-blue-200 dark:bg-blue-600'
								} rounded`} />
							<div className={`h-3 w-full ${i % 2 === 0
								? 'bg-gray-300 dark:bg-gray-600'
								: 'bg-blue-200 dark:bg-blue-600'
								} rounded`} />
							<div className={`h-3 w-3/4 ${i % 2 === 0
								? 'bg-gray-300 dark:bg-gray-600'
								: 'bg-blue-200 dark:bg-blue-600'
								} rounded`} />
						</div>
					</div>
				</div>
			))}
		</div>
	)
}

export default ChatMessageSkeleton
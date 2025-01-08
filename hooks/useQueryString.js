import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';

const useQueryString = (additionalParams = {}) => {
	const router = useRouter();
	const query = router.query;

	// Memoized function to update query
	const updateQuery = useCallback((keyOrObject, value) => {
		const newQuery = { ...query };

		if (typeof keyOrObject === 'object' && !Array.isArray(keyOrObject)) {
			// If the input is an object, merge it into newQuery
			Object.entries(keyOrObject).forEach(([key, value]) => {
				if (value) {
					newQuery[key] = value;
				} else {
					delete newQuery[key];
				}
			});
		} else {
			// If it's a single key-value pair
			if (value) {
				newQuery[keyOrObject] = value;
			} else {
				delete newQuery[keyOrObject];
			}
		}

		// Update the query string in the URL without reloading the page
		router.push({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
	}, [query, router]);

	// Memoized query string builder
	const queryString = useMemo(() => {
		const combinedParams = {
			...query,
			...additionalParams,
		};

		const filteredQueryParams = Object.entries(combinedParams)
			.filter(([_, value]) => value) // Filter out falsy values
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`);

		return filteredQueryParams.length > 0 ? filteredQueryParams.join("&") : "";
	}, [query, additionalParams]);

	return { queryString, updateQuery }; // Return both queryString and updateQuery
};

export default useQueryString;

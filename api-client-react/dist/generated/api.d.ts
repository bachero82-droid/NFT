import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AuthResponse, Card, CardInput, CardUpdate, CoinflipInput, CoinflipResult, CrashCashoutInput, CrashResult, CrashRound, CrashStartInput, GameRecord, GetMarketListingsParams, HealthStatus, LeaderboardEntry, Listing, ListingInput, LoginInput, MessageResponse, ProfileUpdate, RegisterInput, Transaction, TransferInput, User, UserStats } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRegisterUrl: () => string;
/**
 * @summary Register a new user
 */
export declare const register: (registerInput: RegisterInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getRegisterMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export type RegisterMutationResult = NonNullable<Awaited<ReturnType<typeof register>>>;
export type RegisterMutationBody = BodyType<RegisterInput>;
export type RegisterMutationError = ErrorType<void>;
/**
* @summary Register a new user
*/
export declare const useRegister: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export declare const getLoginUrl: () => string;
/**
 * @summary Login
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<void>;
/**
* @summary Login
*/
export declare const useLogin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getLogoutUrl: () => string;
/**
 * @summary Logout
 */
export declare const logout: (options?: RequestInit) => Promise<MessageResponse>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
* @summary Logout
*/
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export declare const getGetMeUrl: () => string;
/**
 * @summary Get current user
 */
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<void>;
/**
 * @summary Get current user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetUserByUsernameUrl: (username: string) => string;
/**
 * @summary Get user profile by username
 */
export declare const getUserByUsername: (username: string, options?: RequestInit) => Promise<User>;
export declare const getGetUserByUsernameQueryKey: (username: string) => readonly [`/api/users/${string}`];
export declare const getGetUserByUsernameQueryOptions: <TData = Awaited<ReturnType<typeof getUserByUsername>>, TError = ErrorType<void>>(username: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUserByUsername>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUserByUsername>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserByUsernameQueryResult = NonNullable<Awaited<ReturnType<typeof getUserByUsername>>>;
export type GetUserByUsernameQueryError = ErrorType<void>;
/**
 * @summary Get user profile by username
 */
export declare function useGetUserByUsername<TData = Awaited<ReturnType<typeof getUserByUsername>>, TError = ErrorType<void>>(username: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUserByUsername>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateProfileUrl: () => string;
/**
 * @summary Update own profile
 */
export declare const updateProfile: (profileUpdate: ProfileUpdate, options?: RequestInit) => Promise<User>;
export declare const getUpdateProfileMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
        data: BodyType<ProfileUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
    data: BodyType<ProfileUpdate>;
}, TContext>;
export type UpdateProfileMutationResult = NonNullable<Awaited<ReturnType<typeof updateProfile>>>;
export type UpdateProfileMutationBody = BodyType<ProfileUpdate>;
export type UpdateProfileMutationError = ErrorType<unknown>;
/**
* @summary Update own profile
*/
export declare const useUpdateProfile: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
        data: BodyType<ProfileUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProfile>>, TError, {
    data: BodyType<ProfileUpdate>;
}, TContext>;
export declare const getGetMyStatsUrl: () => string;
/**
 * @summary Get current user stats
 */
export declare const getMyStats: (options?: RequestInit) => Promise<UserStats>;
export declare const getGetMyStatsQueryKey: () => readonly ["/api/users/me/stats"];
export declare const getGetMyStatsQueryOptions: <TData = Awaited<ReturnType<typeof getMyStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMyStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMyStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getMyStats>>>;
export type GetMyStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get current user stats
 */
export declare function useGetMyStats<TData = Awaited<ReturnType<typeof getMyStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMyCardsUrl: () => string;
/**
 * @summary Get current user's cards
 */
export declare const getMyCards: (options?: RequestInit) => Promise<Card[]>;
export declare const getGetMyCardsQueryKey: () => readonly ["/api/cards"];
export declare const getGetMyCardsQueryOptions: <TData = Awaited<ReturnType<typeof getMyCards>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyCards>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMyCards>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMyCardsQueryResult = NonNullable<Awaited<ReturnType<typeof getMyCards>>>;
export type GetMyCardsQueryError = ErrorType<unknown>;
/**
 * @summary Get current user's cards
 */
export declare function useGetMyCards<TData = Awaited<ReturnType<typeof getMyCards>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyCards>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCardUrl: () => string;
/**
 * @summary Create a new card
 */
export declare const createCard: (cardInput: CardInput, options?: RequestInit) => Promise<Card>;
export declare const getCreateCardMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCard>>, TError, {
        data: BodyType<CardInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCard>>, TError, {
    data: BodyType<CardInput>;
}, TContext>;
export type CreateCardMutationResult = NonNullable<Awaited<ReturnType<typeof createCard>>>;
export type CreateCardMutationBody = BodyType<CardInput>;
export type CreateCardMutationError = ErrorType<unknown>;
/**
* @summary Create a new card
*/
export declare const useCreateCard: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCard>>, TError, {
        data: BodyType<CardInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCard>>, TError, {
    data: BodyType<CardInput>;
}, TContext>;
export declare const getGetCardUrl: (id: number) => string;
/**
 * @summary Get a card by ID
 */
export declare const getCard: (id: number, options?: RequestInit) => Promise<Card>;
export declare const getGetCardQueryKey: (id: number) => readonly [`/api/cards/${number}`];
export declare const getGetCardQueryOptions: <TData = Awaited<ReturnType<typeof getCard>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCardQueryResult = NonNullable<Awaited<ReturnType<typeof getCard>>>;
export type GetCardQueryError = ErrorType<unknown>;
/**
 * @summary Get a card by ID
 */
export declare function useGetCard<TData = Awaited<ReturnType<typeof getCard>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateCardUrl: (id: number) => string;
/**
 * @summary Update a card
 */
export declare const updateCard: (id: number, cardUpdate: CardUpdate, options?: RequestInit) => Promise<Card>;
export declare const getUpdateCardMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCard>>, TError, {
        id: number;
        data: BodyType<CardUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCard>>, TError, {
    id: number;
    data: BodyType<CardUpdate>;
}, TContext>;
export type UpdateCardMutationResult = NonNullable<Awaited<ReturnType<typeof updateCard>>>;
export type UpdateCardMutationBody = BodyType<CardUpdate>;
export type UpdateCardMutationError = ErrorType<unknown>;
/**
* @summary Update a card
*/
export declare const useUpdateCard: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCard>>, TError, {
        id: number;
        data: BodyType<CardUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCard>>, TError, {
    id: number;
    data: BodyType<CardUpdate>;
}, TContext>;
export declare const getDeleteCardUrl: (id: number) => string;
/**
 * @summary Delete a card
 */
export declare const deleteCard: (id: number, options?: RequestInit) => Promise<MessageResponse>;
export declare const getDeleteCardMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCard>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCard>>, TError, {
    id: number;
}, TContext>;
export type DeleteCardMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCard>>>;
export type DeleteCardMutationError = ErrorType<unknown>;
/**
* @summary Delete a card
*/
export declare const useDeleteCard: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCard>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCard>>, TError, {
    id: number;
}, TContext>;
export declare const getSetPrimaryCardUrl: (id: number) => string;
/**
 * @summary Set card as primary
 */
export declare const setPrimaryCard: (id: number, options?: RequestInit) => Promise<Card>;
export declare const getSetPrimaryCardMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof setPrimaryCard>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof setPrimaryCard>>, TError, {
    id: number;
}, TContext>;
export type SetPrimaryCardMutationResult = NonNullable<Awaited<ReturnType<typeof setPrimaryCard>>>;
export type SetPrimaryCardMutationError = ErrorType<unknown>;
/**
* @summary Set card as primary
*/
export declare const useSetPrimaryCard: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof setPrimaryCard>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof setPrimaryCard>>, TError, {
    id: number;
}, TContext>;
export declare const getGetMarketListingsUrl: (params?: GetMarketListingsParams) => string;
/**
 * @summary Get all marketplace listings
 */
export declare const getMarketListings: (params?: GetMarketListingsParams, options?: RequestInit) => Promise<Listing[]>;
export declare const getGetMarketListingsQueryKey: (params?: GetMarketListingsParams) => readonly ["/api/marketplace", ...GetMarketListingsParams[]];
export declare const getGetMarketListingsQueryOptions: <TData = Awaited<ReturnType<typeof getMarketListings>>, TError = ErrorType<unknown>>(params?: GetMarketListingsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMarketListings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMarketListings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMarketListingsQueryResult = NonNullable<Awaited<ReturnType<typeof getMarketListings>>>;
export type GetMarketListingsQueryError = ErrorType<unknown>;
/**
 * @summary Get all marketplace listings
 */
export declare function useGetMarketListings<TData = Awaited<ReturnType<typeof getMarketListings>>, TError = ErrorType<unknown>>(params?: GetMarketListingsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMarketListings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetTrendingListingsUrl: () => string;
/**
 * @summary Get trending listings
 */
export declare const getTrendingListings: (options?: RequestInit) => Promise<Listing[]>;
export declare const getGetTrendingListingsQueryKey: () => readonly ["/api/marketplace/trending"];
export declare const getGetTrendingListingsQueryOptions: <TData = Awaited<ReturnType<typeof getTrendingListings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTrendingListings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTrendingListings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTrendingListingsQueryResult = NonNullable<Awaited<ReturnType<typeof getTrendingListings>>>;
export type GetTrendingListingsQueryError = ErrorType<unknown>;
/**
 * @summary Get trending listings
 */
export declare function useGetTrendingListings<TData = Awaited<ReturnType<typeof getTrendingListings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTrendingListings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateListingUrl: () => string;
/**
 * @summary List a card for sale
 */
export declare const createListing: (listingInput: ListingInput, options?: RequestInit) => Promise<Listing>;
export declare const getCreateListingMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createListing>>, TError, {
        data: BodyType<ListingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createListing>>, TError, {
    data: BodyType<ListingInput>;
}, TContext>;
export type CreateListingMutationResult = NonNullable<Awaited<ReturnType<typeof createListing>>>;
export type CreateListingMutationBody = BodyType<ListingInput>;
export type CreateListingMutationError = ErrorType<unknown>;
/**
* @summary List a card for sale
*/
export declare const useCreateListing: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createListing>>, TError, {
        data: BodyType<ListingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createListing>>, TError, {
    data: BodyType<ListingInput>;
}, TContext>;
export declare const getDeleteListingUrl: (id: number) => string;
/**
 * @summary Remove a listing
 */
export declare const deleteListing: (id: number, options?: RequestInit) => Promise<MessageResponse>;
export declare const getDeleteListingMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteListing>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteListing>>, TError, {
    id: number;
}, TContext>;
export type DeleteListingMutationResult = NonNullable<Awaited<ReturnType<typeof deleteListing>>>;
export type DeleteListingMutationError = ErrorType<unknown>;
/**
* @summary Remove a listing
*/
export declare const useDeleteListing: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteListing>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteListing>>, TError, {
    id: number;
}, TContext>;
export declare const getBuyListingUrl: (id: number) => string;
/**
 * @summary Buy a card from the marketplace
 */
export declare const buyListing: (id: number, options?: RequestInit) => Promise<Card>;
export declare const getBuyListingMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof buyListing>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof buyListing>>, TError, {
    id: number;
}, TContext>;
export type BuyListingMutationResult = NonNullable<Awaited<ReturnType<typeof buyListing>>>;
export type BuyListingMutationError = ErrorType<unknown>;
/**
* @summary Buy a card from the marketplace
*/
export declare const useBuyListing: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof buyListing>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof buyListing>>, TError, {
    id: number;
}, TContext>;
export declare const getGetTransactionsUrl: () => string;
/**
 * @summary Get current user's transaction history
 */
export declare const getTransactions: (options?: RequestInit) => Promise<Transaction[]>;
export declare const getGetTransactionsQueryKey: () => readonly ["/api/transactions"];
export declare const getGetTransactionsQueryOptions: <TData = Awaited<ReturnType<typeof getTransactions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTransactions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTransactions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTransactionsQueryResult = NonNullable<Awaited<ReturnType<typeof getTransactions>>>;
export type GetTransactionsQueryError = ErrorType<unknown>;
/**
 * @summary Get current user's transaction history
 */
export declare function useGetTransactions<TData = Awaited<ReturnType<typeof getTransactions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTransactions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getTransferUrl: () => string;
/**
 * @summary Send VEX coins to another user
 */
export declare const transfer: (transferInput: TransferInput, options?: RequestInit) => Promise<Transaction>;
export declare const getTransferMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof transfer>>, TError, {
        data: BodyType<TransferInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof transfer>>, TError, {
    data: BodyType<TransferInput>;
}, TContext>;
export type TransferMutationResult = NonNullable<Awaited<ReturnType<typeof transfer>>>;
export type TransferMutationBody = BodyType<TransferInput>;
export type TransferMutationError = ErrorType<unknown>;
/**
* @summary Send VEX coins to another user
*/
export declare const useTransfer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof transfer>>, TError, {
        data: BodyType<TransferInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof transfer>>, TError, {
    data: BodyType<TransferInput>;
}, TContext>;
export declare const getPlayCoinflipUrl: () => string;
/**
 * @summary Play a coinflip game
 */
export declare const playCoinflip: (coinflipInput: CoinflipInput, options?: RequestInit) => Promise<CoinflipResult>;
export declare const getPlayCoinflipMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof playCoinflip>>, TError, {
        data: BodyType<CoinflipInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof playCoinflip>>, TError, {
    data: BodyType<CoinflipInput>;
}, TContext>;
export type PlayCoinflipMutationResult = NonNullable<Awaited<ReturnType<typeof playCoinflip>>>;
export type PlayCoinflipMutationBody = BodyType<CoinflipInput>;
export type PlayCoinflipMutationError = ErrorType<unknown>;
/**
* @summary Play a coinflip game
*/
export declare const usePlayCoinflip: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof playCoinflip>>, TError, {
        data: BodyType<CoinflipInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof playCoinflip>>, TError, {
    data: BodyType<CoinflipInput>;
}, TContext>;
export declare const getStartCrashUrl: () => string;
/**
 * @summary Start a crash game round
 */
export declare const startCrash: (crashStartInput: CrashStartInput, options?: RequestInit) => Promise<CrashRound>;
export declare const getStartCrashMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof startCrash>>, TError, {
        data: BodyType<CrashStartInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof startCrash>>, TError, {
    data: BodyType<CrashStartInput>;
}, TContext>;
export type StartCrashMutationResult = NonNullable<Awaited<ReturnType<typeof startCrash>>>;
export type StartCrashMutationBody = BodyType<CrashStartInput>;
export type StartCrashMutationError = ErrorType<unknown>;
/**
* @summary Start a crash game round
*/
export declare const useStartCrash: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof startCrash>>, TError, {
        data: BodyType<CrashStartInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof startCrash>>, TError, {
    data: BodyType<CrashStartInput>;
}, TContext>;
export declare const getCashoutCrashUrl: () => string;
/**
 * @summary Cash out from crash game
 */
export declare const cashoutCrash: (crashCashoutInput: CrashCashoutInput, options?: RequestInit) => Promise<CrashResult>;
export declare const getCashoutCrashMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof cashoutCrash>>, TError, {
        data: BodyType<CrashCashoutInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof cashoutCrash>>, TError, {
    data: BodyType<CrashCashoutInput>;
}, TContext>;
export type CashoutCrashMutationResult = NonNullable<Awaited<ReturnType<typeof cashoutCrash>>>;
export type CashoutCrashMutationBody = BodyType<CrashCashoutInput>;
export type CashoutCrashMutationError = ErrorType<unknown>;
/**
* @summary Cash out from crash game
*/
export declare const useCashoutCrash: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof cashoutCrash>>, TError, {
        data: BodyType<CrashCashoutInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof cashoutCrash>>, TError, {
    data: BodyType<CrashCashoutInput>;
}, TContext>;
export declare const getGetGameHistoryUrl: () => string;
/**
 * @summary Get user's game history
 */
export declare const getGameHistory: (options?: RequestInit) => Promise<GameRecord[]>;
export declare const getGetGameHistoryQueryKey: () => readonly ["/api/games/history"];
export declare const getGetGameHistoryQueryOptions: <TData = Awaited<ReturnType<typeof getGameHistory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGameHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getGameHistory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetGameHistoryQueryResult = NonNullable<Awaited<ReturnType<typeof getGameHistory>>>;
export type GetGameHistoryQueryError = ErrorType<unknown>;
/**
 * @summary Get user's game history
 */
export declare function useGetGameHistory<TData = Awaited<ReturnType<typeof getGameHistory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGameHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetLeaderboardUrl: () => string;
/**
 * @summary Get game leaderboard
 */
export declare const getLeaderboard: (options?: RequestInit) => Promise<LeaderboardEntry[]>;
export declare const getGetLeaderboardQueryKey: () => readonly ["/api/games/leaderboard"];
export declare const getGetLeaderboardQueryOptions: <TData = Awaited<ReturnType<typeof getLeaderboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLeaderboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLeaderboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLeaderboardQueryResult = NonNullable<Awaited<ReturnType<typeof getLeaderboard>>>;
export type GetLeaderboardQueryError = ErrorType<unknown>;
/**
 * @summary Get game leaderboard
 */
export declare function useGetLeaderboard<TData = Awaited<ReturnType<typeof getLeaderboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLeaderboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map
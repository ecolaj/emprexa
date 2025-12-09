import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CurrentView = 'main' | 'hashtag' | 'user-profile' | 'ods' | 'user-public' | 'dashboard' | 'public-post' | 'pricing';

interface NavigationState {
  currentView: CurrentView;
  currentHashtag: string | null;
  currentProfileUsername: string | null;
  currentODS: number | null;
  currentUsername: string | null;
  currentPostId: string | null; // 🆕 NUEVO: Para posts públicos
}

interface NavigationContextType extends NavigationState {
  navigateToHashtag: (hashtag: string) => void;
  navigateToUserProfile: (username: string) => void;
  navigateToMain: () => void;
  navigateToODS: (odsNumero: number) => void;
  navigateToUserPublic: (username: string) => void;
  navigateToDashboard: () => void;
  navigateToPublicPost: (postId: string) => void; // 🆕 NUEVO
  navigateToPricing: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [navigation, setNavigation] = useState<NavigationState>({
    currentView: 'main',
    currentHashtag: null,
    currentProfileUsername: null,
    currentODS: null,
    currentUsername: null,
    currentPostId: null, // 🆕 NUEVO
  });

  const navigateToHashtag = (hashtag: string) => {
    setNavigation({
      currentView: 'hashtag',
      currentHashtag: hashtag,
      currentProfileUsername: null,
      currentODS: null,
      currentUsername: null,
      currentPostId: null, // 🆕 NUEVO
    });
  };

  const navigateToODS = (odsNumero: number) => {
    setNavigation({
      currentView: 'ods',
      currentHashtag: null,
      currentProfileUsername: null,
      currentODS: odsNumero,
      currentUsername: null,
      currentPostId: null,
    });
  };

  const navigateToUserPublic = (username: string) => {
    setNavigation({
      currentView: 'user-public',
      currentHashtag: null,
      currentProfileUsername: null,
      currentODS: null,
      currentUsername: username,
      currentPostId: null,
    });
  };

  const navigateToDashboard = () => {
    setNavigation({
      currentView: 'dashboard',
      currentHashtag: null,
      currentProfileUsername: null,
      currentODS: null,
      currentUsername: null,
      currentPostId: null,
    });
  };

  const navigateToPublicPost = (postId: string) => {
    setNavigation({
      currentView: 'public-post',
      currentHashtag: null,
      currentProfileUsername: null,
      currentODS: null,
      currentUsername: null,
      currentPostId: postId, // 🆕 NUEVO: Post ID específico
    });
  };

  const navigateToPricing = () => {
    setNavigation({
      currentView: 'pricing',
      currentHashtag: null,
      currentProfileUsername: null,
      currentODS: null,
      currentUsername: null,
      currentPostId: null,
    });
  };

  const navigateToUserProfile = (username: string) => {
    setNavigation({
      currentView: 'user-profile',
      currentHashtag: null,
      currentProfileUsername: username,
      currentODS: null,
      currentUsername: null,
      currentPostId: null,
    });
  };

  const navigateToMain = () => {
    setNavigation({
      currentView: 'main',
      currentHashtag: null,
      currentProfileUsername: null,
      currentODS: null,
      currentUsername: null,
      currentPostId: null,
    });
  };

  return (
    <NavigationContext.Provider
      value={{
        ...navigation,
        navigateToHashtag,
        navigateToUserProfile,
        navigateToMain,
        navigateToODS,
        navigateToUserPublic,
        navigateToDashboard,
        navigateToPublicPost,
        navigateToPricing,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
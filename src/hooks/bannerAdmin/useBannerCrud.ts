import { useState, useEffect, useCallback } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  getDocs,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  limit,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { DbBanner, TagType } from "./useBannerTypes";
import { Product } from "../../domains/product/product.types";
import { apiDelete, apiGet, apiPost, apiPut } from "../../lib/api";

function sortBannersList(list: DbBanner[]): DbBanner[] {
  return [...list].sort((a, b) => {
    const orderA = Number(a.sort_order ?? a.order ?? 999);
    const orderB = Number(b.sort_order ?? b.order ?? 999);
    return orderA - orderB;
  });
}

export function useBannerCrud() {
  const [banners, setBanners] = useState<DbBanner[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [tagName, setTagName] = useState("");
  const [tagSlug, setTagSlug] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Load Banners (API v1 with Firestore fallback, sorted in memory)
      try {
        const res = await apiGet<{ banners?: DbBanner[]; data?: DbBanner[] }>("/api/v1/admin/banners");
        const apiBanners = res.banners || res.data;
        if (Array.isArray(apiBanners)) {
          setBanners(sortBannersList(apiBanners));
        } else {
          const snapBanners = await getDocs(collection(db, "banners"));
          const rawBanners = snapBanners.docs.map((d) => ({ id: d.id, ...d.data() }) as DbBanner);
          setBanners(sortBannersList(rawBanners));
        }
      } catch {
        const snapBanners = await getDocs(collection(db, "banners"));
        const rawBanners = snapBanners.docs.map((d) => ({ id: d.id, ...d.data() }) as DbBanner);
        setBanners(sortBannersList(rawBanners));
      }

      // 2. Load Tags (isolated)
      try {
        const tagRes = await apiGet<{ tags?: TagType[] }>("/api/v1/settings/tags");
        if (Array.isArray(tagRes?.tags)) {
          setTags(tagRes.tags);
        } else {
          const snapTags = await getDocs(query(collection(db, "tags"), limit(300)));
          setTags(snapTags.docs.map((d) => ({ id: d.id, ...d.data() }) as TagType));
        }
      } catch {
        try {
          const snapTags = await getDocs(query(collection(db, "tags"), limit(300)));
          setTags(snapTags.docs.map((d) => ({ id: d.id, ...d.data() }) as TagType));
        } catch {
          setTags([]);
        }
      }

      // 3. Load Products (filter by status == "active" to satisfy Firestore rules even before custom claim sync)
      try {
        const qProducts = query(
          collection(db, "products"),
          where("status", "==", "active"),
          limit(400)
        );
        const snapProducts = await getDocs(qProducts);
        setAllProducts(snapProducts.docs.map((d) => ({ id: d.id, ...d.data() }) as Product));
      } catch {
        try {
          const homeRes = await apiGet<{ featuredProducts?: Product[] }>("/api/v1/public/home-data");
          if (Array.isArray(homeRes?.featuredProducts)) {
            setAllProducts(homeRes.featuredProducts);
          }
        } catch {
          setAllProducts([]);
        }
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erreur réseau lors de la récupération des bannières"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleTagNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTagName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setTagSlug(slug);
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName || !tagSlug) {
      toast.error("Veuillez remplir le nom et le slug du tag");
      return;
    }

    try {
      await addDoc(collection(db, "tags"), { name: tagName, slug: tagSlug });
      toast.success(`Tag "${tagName}" créé !`);
      setTagName("");
      setTagSlug("");
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la création du tag");
    }
  };

  const handleDeleteTag = async (id: string, _name: string) => {
    try {
      await deleteDoc(doc(db, "tags", id));
      toast.success("Tag supprimé avec succès");
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      try {
        await apiDelete(`/api/v1/admin/banners/${id}`);
      } catch {
        await deleteDoc(doc(db, "banners", id));
      }
      toast.success("Bannière supprimée");
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  const handleToggleBannerActive = async (banner: DbBanner) => {
    const nextActive = !banner.is_active;
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, is_active: nextActive } : b))
    );
    try {
      try {
        await apiPut(`/api/v1/admin/banners/${banner.id}`, {
          is_active: nextActive,
          isActive: nextActive,
        });
      } catch {
        await updateDoc(doc(db, "banners", banner.id), {
          is_active: nextActive,
          isActive: nextActive,
        });
      }
      toast.success(nextActive ? "Bannière publiée en ligne !" : "Bannière passée en brouillon");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur lors du changement de statut");
      await fetchData();
    }
  };

  const handleDuplicateBanner = async (banner: DbBanner) => {
    try {
      const { id: _id, ...rest } = banner;
      const duplicatePayload = {
        ...rest,
        title: `${banner.title || "Bannière"} (Copie)`,
        is_active: false,
        isActive: false,
        sort_order: banners.length + 1,
        order: banners.length + 1,
        views: 0,
        clicks: 0,
        created_at: new Date().toISOString(),
      };
      try {
        await apiPost("/api/v1/admin/banners", duplicatePayload);
      } catch {
        await addDoc(collection(db, "banners"), duplicatePayload);
      }
      toast.success("Bannière dupliquée en brouillon !");
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la duplication");
    }
  };

  return {
    banners,
    setBanners,
    tags,
    setTags,
    allProducts,
    isLoading,
    tagName,
    setTagName,
    tagSlug,
    setTagSlug,
    fetchData,
    handleTagNameChange,
    handleCreateTag,
    handleDeleteTag,
    handleDeleteBanner,
    handleToggleBannerActive,
    handleDuplicateBanner,
  };
}

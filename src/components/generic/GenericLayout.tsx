"use client";

import Button from "@/components/common/Button";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchDocuments } from "@/app/actions/crudActions";
import { GenericDataContextType } from "@/context/GenericDataContext";
import { RoleFilter } from "@/components/search/RoleFilter";
import { useEffect } from "react";

interface GenericLayoutProps {
  children: React.ReactNode;
  context: GenericDataContextType;
}

export function GenericLayout({ children, context }: GenericLayoutProps) {
  const {
    items,
    isLoading,
    searchItems,
    selectItem,
    entityConfig,
    roleFilter,
    setRoleFilter,
  } = context;

  const router = useRouter();

  // Handle selecting an item to view
  const handleSelectItem = (item, isNew = false) => {
    if (isNew) {
      router.push(`/${entityConfig.name}/new`);
    } else if (item && item._id) {
      router.push(`/${entityConfig.name}/${item._id}`);
    } else {
      router.push(`/${entityConfig.name}`);
    }
  };

  // Handle copying an item
  const handleCopyItem = async (item) => {
    try {
      // First navigate to the new page
      router.push(`/${entityConfig.name}/new`);

      // Then fetch the full item data to ensure we have all fields
      const result = await searchDocuments(
        entityConfig.name,
        item._id.toString(),
        "_id"
      );

      if (Array.isArray(result) && result.length > 0) {
        // Make a deep clone of the source item
        const sourceItem = JSON.parse(JSON.stringify(result[0]));

        // Remove the _id to create a new item
        delete sourceItem._id;

        // Update the name to indicate it's a copy
        if (sourceItem.name) {
          sourceItem.name = `${sourceItem.name} (Copy)`;
        } else if (sourceItem.general?.firstName) {
          sourceItem.general.firstName = `${sourceItem.general.firstName} (Copy)`;
        } else if (sourceItem.reference) {
          sourceItem.reference = `${sourceItem.reference} (Copy)`;
        }

        // Use setTimeout to ensure this runs after navigation is complete
        setTimeout(() => {
          // Select the item with edit mode enabled
          selectItem(sourceItem, true);
        }, 100);
      }
    } catch (error) {
      console.error(
        `Error creating ${entityConfig.displayName.toLowerCase()} copy:`,
        error
      );
    }
  };

  // Re-run search when role filters change (contacts only)
  useEffect(() => {
    if (entityConfig.name === "contacts") {
      searchItems();
    }
  }, [roleFilter.bookerChecked, roleFilter.guestChecked, entityConfig.name]);

  return (
    <>
      <div className="search-area">
        <div className="search-panel">
          <SearchBar
            onSearch={searchItems}
            isLoading={isLoading}
            type={entityConfig.name}
          />

          <div className="filter-search-container">
            {entityConfig.name === "contacts" && (
              <RoleFilter
                bookerChecked={roleFilter.bookerChecked}
                guestChecked={roleFilter.guestChecked}
                onBookerChange={(checked) =>
                  setRoleFilter({ bookerChecked: checked })
                }
                onGuestChange={(checked) =>
                  setRoleFilter({ guestChecked: checked })
                }
              />
            )}

            <div className="button-container">
              <Button icon={Plus} onClick={() => handleSelectItem({}, true)}>
                New {entityConfig.displayName}
              </Button>
            </div>
          </div>

          <SearchResults
            items={items}
            onSelect={handleSelectItem}
            onCopy={handleCopyItem}
            type={entityConfig.name}
          />
        </div>
      </div>

      <div className="details-panel">{children}</div>
    </>
  );
}

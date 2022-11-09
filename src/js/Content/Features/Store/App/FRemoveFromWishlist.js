import {ExtensionResources, HTML, Localization} from "../../../../modulesCore";
import {DynamicStore, Feature, User} from "../../../modulesContent";
import {Page} from "../../Page";

export default class FRemoveFromWishlist extends Feature {

    checkPrerequisites() {
        return User.isSignedIn && !this.context.isOwned;
    }

    apply() {

        const successBtn = document.querySelector("#add_to_wishlist_area_success > a");

        // Update tooltip for wishlisted items
        successBtn.dataset.tooltipText = Localization.str.remove_from_wishlist_tooltip;

        const imgNode = successBtn.querySelector("img:last-child");
        imgNode.classList.add("es-in-wl");
        HTML.beforeBegin(imgNode,
            `<img class="es-remove-wl" src="${ExtensionResources.getURL("img/remove.png")}" style="display: none;">
            <img class="es-loading-wl" src="//community.cloudflare.steamstatic.com/public/images/login/throbber.gif" style="display: none;">`);

        successBtn.addEventListener("click", async e => {
            e.preventDefault();

            const parent = successBtn.closest(".queue_actions_ctn");
            if (parent.classList.contains("loading")) { return; }
            parent.classList.add("loading");

            const removeWaitlist = Boolean(
                document.querySelector(".queue_btn_wishlist + .queue_btn_ignore_menu.owned_elsewhere")
            );

            try {
                await Promise.all([
                    this.context.removeFromWishlist(),
                    removeWaitlist ? this.context.removeFromWaitlist() : Promise.resolve(),
                ]);

                if (this.context.onWishAndWaitlistRemove) { this.context.onWishAndWaitlistRemove(); }

                document.getElementById("add_to_wishlist_area").style.display = "";

                DynamicStore.clear();

                Page.runInPageContext(() => { window.SteamFacade.dynamicStoreInvalidateCache(); });
            } catch (err) {
                document.getElementById("add_to_wishlist_area_fail").style.display = "";
                this.logError(err, "Failed to remove app from wishlist");
            } finally {
                document.getElementById("add_to_wishlist_area_success").style.display = "none";
                parent.classList.remove("loading");
            }
        });

        for (const node of document.querySelectorAll("#add_to_wishlist_area, #add_to_wishlist_area_success, .queue_btn_ignore")) {
            node.addEventListener("click", DynamicStore.clear);
        }
    }
}

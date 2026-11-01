// ==========================================================================
// THE GRAND AURA - INTERACTIVE JAVASCRIPT ENGINE
// 1. Dark/Light Mode Theme Switcher
// 2. Interactive Room Category Filtering
// 3. One-Click Room Selection from Cards
// 4. Real-time Fare Estimator & Date Validations
// 5. Promo Coupon System (AURA20 / ROYAL500)
// 6. Luxury Reservation Pass / Printable Voucher Generator
// 7. Interactive Live Guest Review Poster
// 8. Interactive FAQ Accordion
// ==========================================================================

document.addEventListener("DOMContentLoaded", function () {

    // ----------------------------------------------------------------------
    // 1. Dark / Light Luxury Mode Switcher
    // ----------------------------------------------------------------------
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const themeIcon = document.getElementById("themeIcon");
    const themeText = document.getElementById("themeText");
    const body = document.body;

    themeToggleBtn.addEventListener("click", function () {
        body.classList.toggle("theme-dark");
        const isDark = body.classList.contains("theme-dark");

        if (isDark) {
            themeIcon.innerText = "☀️";
            themeText.innerText = "Day Mode";
        } else {
            themeIcon.innerText = "🌙";
            themeText.innerText = "Night Mode";
        }
    });

    // ----------------------------------------------------------------------
    // 2. Interactive Room Category Filtering
    // ----------------------------------------------------------------------
    const filterButtons = document.querySelectorAll(".filter-btn");
    const roomBoxes = document.querySelectorAll(".room-box");

    filterButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            // Remove active from all buttons
            filterButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            const filterValue = this.getAttribute("data-filter");

            roomBoxes.forEach(box => {
                const category = box.getAttribute("data-category");
                if (filterValue === "all" || filterValue === category) {
                    box.style.display = "flex";
                } else {
                    box.style.display = "none";
                }
            });
        });
    });

    // ----------------------------------------------------------------------
    // 3. "Reserve This Room" Quick Selection from Room Cards
    // ----------------------------------------------------------------------
    const selectRoomButtons = document.querySelectorAll(".select-room-btn");
    const roomSelectDropdown = document.getElementById("roomType");
    const bookingSection = document.getElementById("booking");

    selectRoomButtons.forEach(button => {
        button.addEventListener("click", function () {
            const roomId = this.getAttribute("data-room-id");
            roomSelectDropdown.value = roomId;

            // Trigger live calculation update
            updateLiveEstimator();

            // Smooth scroll directly to booking form
            bookingSection.scrollIntoView({ behavior: "smooth" });
        });
    });

    // ----------------------------------------------------------------------
    // 4. Date Setup & Real-time Live Price Calculator
    // ----------------------------------------------------------------------
    const checkInInput = document.getElementById("checkIn");
    const checkOutInput = document.getElementById("checkOut");
    const guestsInput = document.getElementById("guests");

    // Dynamic minimum date: Set today as the earliest selectable date
    const today = new Date().toISOString().split("T")[0];
    checkInInput.setAttribute("min", today);
    checkOutInput.setAttribute("min", today);

    // Default dates: Check-in = Today, Check-out = Tomorrow
    checkInInput.value = today;
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split("T")[0];
    checkOutInput.value = tomorrowStr;
    checkOutInput.setAttribute("min", tomorrowStr);

    checkInInput.addEventListener("change", function () {
        if (checkInInput.value) {
            checkOutInput.setAttribute("min", checkInInput.value);
            // If checkout is before new check-in, auto advance checkout by 1 day
            if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
                const nextDay = new Date(checkInInput.value);
                nextDay.setDate(nextDay.getDate() + 1);
                checkOutInput.value = nextDay.toISOString().split("T")[0];
            }
        }
        updateLiveEstimator();
    });

    checkOutInput.addEventListener("change", updateLiveEstimator);
    roomSelectDropdown.addEventListener("change", updateLiveEstimator);
    guestsInput.addEventListener("change", updateLiveEstimator);

    // Promo Code Variables
    let appliedDiscountPercent = 0;
    let appliedFlatDiscount = 0;

    function updateLiveEstimator() {
        const liveRoomName = document.getElementById("liveRoomName");
        const liveRate = document.getElementById("liveRate");
        const liveNights = document.getElementById("liveNights");
        const liveBaseCost = document.getElementById("liveBaseCost");
        const liveDiscountRow = document.getElementById("liveDiscountRow");
        const liveDiscount = document.getElementById("liveDiscount");
        const liveTax = document.getElementById("liveTax");
        const liveTotal = document.getElementById("liveTotal");

        const selectedOption = roomSelectDropdown.options[roomSelectDropdown.selectedIndex];
        const roomPrice = parseFloat(roomSelectDropdown.value) || 0;
        const roomTitle = selectedOption.getAttribute("data-name") || "None Chosen";

        liveRoomName.innerText = roomTitle;
        liveRate.innerText = roomPrice > 0 ? "₹" + roomPrice.toLocaleString("en-IN") : "₹0";

        const inVal = checkInInput.value;
        const outVal = checkOutInput.value;

        if (!inVal || !outVal || !roomPrice) {
            liveNights.innerText = "0 Night(s)";
            liveBaseCost.innerText = "₹0";
            liveTax.innerText = "₹0";
            liveTotal.innerText = "₹0";
            liveDiscountRow.style.display = "none";
            return;
        }

        const dIn = new Date(inVal);
        const dOut = new Date(outVal);

        if (dOut <= dIn) {
            liveNights.innerText = "Invalid Dates";
            liveBaseCost.innerText = "₹0";
            liveTax.innerText = "₹0";
            liveTotal.innerText = "₹0";
            return;
        }

        const timeDiff = dOut.getTime() - dIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        liveNights.innerText = nights + " Night(s)";

        const baseTotal = nights * roomPrice;
        liveBaseCost.innerText = "₹" + baseTotal.toLocaleString("en-IN");

        // Calculate discount
        let discountAmount = 0;
        if (appliedDiscountPercent > 0) {
            discountAmount = Math.round(baseTotal * (appliedDiscountPercent / 100));
        } else if (appliedFlatDiscount > 0) {
            discountAmount = appliedFlatDiscount;
        }

        if (discountAmount > 0) {
            liveDiscountRow.style.display = "flex";
            liveDiscount.innerText = "- ₹" + discountAmount.toLocaleString("en-IN");
        } else {
            liveDiscountRow.style.display = "none";
        }

        const costAfterDiscount = Math.max(0, baseTotal - discountAmount);
        const taxAmount = Math.round(costAfterDiscount * 0.12); // 12% Luxury GST
        const finalGrandTotal = costAfterDiscount + taxAmount;

        liveTax.innerText = "₹" + taxAmount.toLocaleString("en-IN");
        liveTotal.innerText = "₹" + finalGrandTotal.toLocaleString("en-IN");
    }

    // Run once on load to show initial calculation if room selected
    updateLiveEstimator();

    // ----------------------------------------------------------------------
    // 5. Promo Coupon System (AURA20 / ROYAL500)
    // ----------------------------------------------------------------------
    const applyCouponBtn = document.getElementById("applyCouponBtn");
    const couponInput = document.getElementById("couponCode");
    const couponMessage = document.getElementById("couponMessage");

    applyCouponBtn.addEventListener("click", function () {
        const code = couponInput.value.trim().toUpperCase();

        if (code === "AURA20") {
            appliedDiscountPercent = 20;
            appliedFlatDiscount = 0;
            couponMessage.className = "coupon-msg success";
            couponMessage.innerText = "🎉 Coupon 'AURA20' Applied! 20% Royal Discount active.";
        } else if (code === "ROYAL500") {
            appliedDiscountPercent = 0;
            appliedFlatDiscount = 500;
            couponMessage.className = "coupon-msg success";
            couponMessage.innerText = "🎉 Coupon 'ROYAL500' Applied! ₹500 Flat Savings active.";
        } else if (code === "") {
            couponMessage.className = "coupon-msg error";
            couponMessage.innerText = "Please enter a valid coupon code.";
        } else {
            appliedDiscountPercent = 0;
            appliedFlatDiscount = 0;
            couponMessage.className = "coupon-msg error";
            couponMessage.innerText = "❌ Invalid Code. Try 'AURA20' for 20% off!";
        }

        updateLiveEstimator();
    });

    // ----------------------------------------------------------------------
    // 6. Booking Submission & Official Reservation Pass Modal
    // ----------------------------------------------------------------------
    const bookingForm = document.getElementById("hotelBookingForm");
    const formAlert = document.getElementById("formAlert");
    const voucherModal = document.getElementById("bookingVoucherModal");
    const closeVoucherBtn = document.getElementById("closeVoucherBtn");

    bookingForm.addEventListener("submit", function (e) {
        e.preventDefault();
        formAlert.style.display = "none";
        formAlert.innerText = "";

        const fullName = document.getElementById("fullName").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const roomVal = roomSelectDropdown.value;
        const guests = guestsInput.value;
        const checkInVal = checkInInput.value;
        const checkOutVal = checkOutInput.value;

        // Validation 1: Suite selected
        if (!roomVal) {
            showFormAlert("Please select a Suite Category from the dropdown.");
            return;
        }

        // Validation 2: Dates validation
        const dIn = new Date(checkInVal);
        const dOut = new Date(checkOutVal);

        if (dOut <= dIn) {
            showFormAlert("Error: Check-Out date must be strictly after Check-In date.");
            return;
        }

        // Validation 3: Phone validation
        if (!/^[0-9]{10}$/.test(phone)) {
            showFormAlert("Please enter a valid 10-digit mobile number.");
            return;
        }

        // Generate Random Reservation ID
        const randomRef = "GA-2026-" + Math.floor(1000 + Math.random() * 9000);
        const selectedOption = roomSelectDropdown.options[roomSelectDropdown.selectedIndex];
        const roomTitle = selectedOption.getAttribute("data-name");
        const roomPrice = parseFloat(roomVal);

        const timeDiff = dOut.getTime() - dIn.getTime();
        const totalNights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        const baseTotal = totalNights * roomPrice;

        let discountAmount = 0;
        if (appliedDiscountPercent > 0) {
            discountAmount = Math.round(baseTotal * (appliedDiscountPercent / 100));
        } else if (appliedFlatDiscount > 0) {
            discountAmount = appliedFlatDiscount;
        }

        const taxableCost = Math.max(0, baseTotal - discountAmount);
        const taxTotal = Math.round(taxableCost * 0.12);
        const finalGrandTotal = taxableCost + taxTotal;

        // Populate Voucher Pass
        document.getElementById("vPassRef").innerText = "#" + randomRef;
        document.getElementById("vPassName").innerText = fullName;
        document.getElementById("vPassContact").innerText = phone + " (" + email + ")";
        document.getElementById("vPassRoom").innerText = roomTitle;
        document.getElementById("vPassGuests").innerText = guests + " Guest(s)";
        document.getElementById("vPassCheckIn").innerText = formatDisplayDate(checkInVal);
        document.getElementById("vPassCheckOut").innerText = formatDisplayDate(checkOutVal);
        document.getElementById("vPassNights").innerText = totalNights + " Night(s)";
        document.getElementById("vPassTotal").innerText = "₹" + finalGrandTotal.toLocaleString("en-IN");

        // Display Modal
        voucherModal.classList.add("open");
    });

    closeVoucherBtn.addEventListener("click", function () {
        voucherModal.classList.remove("open");
    });

    // Close modal when clicking outside content
    voucherModal.addEventListener("click", function (e) {
        if (e.target === voucherModal) {
            voucherModal.classList.remove("open");
        }
    });

    function showFormAlert(msg) {
        formAlert.innerText = msg;
        formAlert.style.display = "block";
        formAlert.scrollIntoView({ behavior: "smooth" });
    }

    function formatDisplayDate(dStr) {
        const opts = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(dStr).toLocaleDateString('en-IN', opts);
    }

    // ----------------------------------------------------------------------
    // 7. Interactive Live Guest Review Submission
    // ----------------------------------------------------------------------
    const submitReviewBtn = document.getElementById("submitReviewBtn");
    const reviewerNameInput = document.getElementById("reviewerName");
    const reviewerRatingInput = document.getElementById("reviewerRating");
    const reviewerCommentInput = document.getElementById("reviewerComment");
    const reviewsContainer = document.getElementById("reviewsContainer");

    submitReviewBtn.addEventListener("click", function () {
        const name = reviewerNameInput.value.trim() || "Distinguished Guest";
        const rating = reviewerRatingInput.value;
        const comment = reviewerCommentInput.value.trim();

        if (!comment) {
            alert("Please enter a short comment for your review!");
            return;
        }

        // Create new review card
        const card = document.createElement("div");
        card.className = "review-card";
        card.style.animation = "fadeInModal 0.4s ease";
        card.innerHTML = `
            <div class="stars">${rating}</div>
            <p>"${comment}"</p>
            <div class="reviewer-info">
                <strong>${name}</strong>
                <small>Stayed Recently • Verified Guest Review</small>
            </div>
        `;

        reviewsContainer.prepend(card);

        // Clear inputs
        reviewerNameInput.value = "";
        reviewerCommentInput.value = "";
        alert("✨ Thank you! Your review has been published live.");
    });

    // ----------------------------------------------------------------------
    // 8. Interactive FAQ Accordion
    // ----------------------------------------------------------------------
    const faqCards = document.querySelectorAll(".faq-card");

    faqCards.forEach(card => {
        const trigger = card.querySelector(".faq-trigger");
        trigger.addEventListener("click", function () {
            const isActive = card.classList.contains("active");

            // Close all
            faqCards.forEach(c => c.classList.remove("active"));

            // If not active, open
            if (!isActive) {
                card.classList.add("active");
            }
        });
    });

});
/* ============================================
   Life Filo - Ana JavaScript Dosyası
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ---- Mobil Menü Toggle ---- */
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Nav link tıklandığında menüyü kapat
        navMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    /* ---- Feature Card Toggle (Neden Biz) ---- */
    document.querySelectorAll('.feature-card-toggle .feature-card-header').forEach(function (header) {
        header.addEventListener('click', function () {
            var card = this.closest('.feature-card-toggle');
            if (!card) return;
            card.classList.toggle('active');
        });
    });

    /* ---- Accordion Açma/Kapama ---- */
    document.querySelectorAll('.accordion-header').forEach(function (header) {
        header.addEventListener('click', function () {
            var item = this.closest('.accordion-item');
            var accordion = this.closest('.accordion');
            if (!item || !accordion) return;

            var isActive = item.classList.contains('active');

            // Aynı accordion içindeki diğer açık öğeleri kapat
            accordion.querySelectorAll('.accordion-item.active').forEach(function (openItem) {
                openItem.classList.remove('active');
            });

            // Tıklanan öğeyi aç/kapat
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    /* ---- İletişim Formu Client-Side Doğrulama ---- */
    var contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            var isValid = true;

            // Önceki hataları temizle
            contactForm.querySelectorAll('.form-group').forEach(function (group) {
                group.classList.remove('has-error');
            });
            contactForm.querySelectorAll('.form-error').forEach(function (err) {
                err.classList.remove('visible');
            });

            // Zorunlu alanları kontrol et
            var requiredFields = [
                { id: 'name', message: 'Ad Soyad alanı zorunludur.' },
                { id: 'email', message: 'E-posta alanı zorunludur.' },
                { id: 'message', message: 'Mesaj alanı zorunludur.' }
            ];

            requiredFields.forEach(function (field) {
                var input = contactForm.querySelector('#' + field.id);
                if (!input) return;

                var value = input.value.trim();
                if (value === '') {
                    isValid = false;
                    var group = input.closest('.form-group');
                    if (group) {
                        group.classList.add('has-error');
                        var errorEl = group.querySelector('.form-error');
                        if (errorEl) {
                            errorEl.textContent = field.message;
                            errorEl.classList.add('visible');
                        }
                    }
                }
            });

            if (!isValid) {
                e.preventDefault();
                return;
            }

            e.preventDefault();

            var submitBtn = contactForm.querySelector('button[type="submit"]');
            var origText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Gönderiliyor...';
            }

            var formData = {
                name: (contactForm.querySelector('#name') || {}).value || '',
                email: (contactForm.querySelector('#email') || {}).value || '',
                phone: (contactForm.querySelector('#phone') || {}).value || '',
                subject: (contactForm.querySelector('#subject') || {}).value || '',
                message: (contactForm.querySelector('#message') || {}).value || ''
            };

            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/contact.php', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function () {
                var res;
                try { res = JSON.parse(xhr.responseText); } catch (err) { res = { success: false, message: 'Bir hata oluştu.' }; }

                var existingAlert = contactForm.parentNode.querySelector('.form-alert');
                if (existingAlert) existingAlert.remove();

                var alertDiv = document.createElement('div');
                alertDiv.className = 'form-alert ' + (res.success ? 'form-alert-success' : 'form-alert-error');
                alertDiv.textContent = res.message;
                contactForm.parentNode.insertBefore(alertDiv, contactForm);

                if (res.success) {
                    contactForm.reset();
                }

                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = origText;
                }

                setTimeout(function () { alertDiv.remove(); }, 6000);
            };
            xhr.onerror = function () {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = origText;
                }
                alert('Bağlantı hatası. Lütfen tekrar deneyin.');
            };
            xhr.send(JSON.stringify(formData));
        });

        // Kullanıcı yazmaya başladığında hataları temizle
        contactForm.querySelectorAll('.form-control').forEach(function (input) {
            input.addEventListener('input', function () {
                var group = this.closest('.form-group');
                if (group) {
                    group.classList.remove('has-error');
                    var errorEl = group.querySelector('.form-error');
                    if (errorEl) {
                        errorEl.classList.remove('visible');
                    }
                }
            });
        });
    }

    /* ---- Araç Filtre Sistemi ---- */
    var filterFuel = document.getElementById('filter-fuel');
    var filterTransmission = document.getElementById('filter-transmission');
    var filterSort = document.getElementById('filter-sort');
    var filterReset = document.getElementById('filter-reset');
    var vehicleGrid = document.getElementById('vehicle-grid');
    var filterToggle = document.querySelector('.filter-toggle');
    var filterBarInner = document.querySelector('.filter-bar-inner');

    // Mobilde collapsible filtre barı
    if (filterToggle && filterBarInner) {
        filterToggle.addEventListener('click', function () {
            filterBarInner.classList.toggle('active');
            filterToggle.textContent = filterBarInner.classList.contains('active')
                ? 'Filtreleri Gizle'
                : 'Filtreleri Göster';
        });
    }

    function applyFilters() {
        if (!vehicleGrid) return;

        var fuel = filterFuel ? filterFuel.value : '';
        var transmission = filterTransmission ? filterTransmission.value : '';
        var sort = filterSort ? filterSort.value : '';

        var cards = vehicleGrid.querySelectorAll('.vehicle-card');

        // Filtrele: AND mantığı
        cards.forEach(function (card) {
            var matchFuel = !fuel || card.getAttribute('data-fuel') === fuel;
            var matchTransmission = !transmission || card.getAttribute('data-transmission') === transmission;

            if (matchFuel && matchTransmission) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });

        // Sırala: sadece görünür kartları data-price'a göre
        if (sort) {
            var visibleCards = Array.prototype.slice.call(
                vehicleGrid.querySelectorAll('.vehicle-card:not(.hidden)')
            );

            visibleCards.sort(function (a, b) {
                var priceA = parseInt(a.getAttribute('data-price'), 10);
                var priceB = parseInt(b.getAttribute('data-price'), 10);
                return sort === 'asc' ? priceA - priceB : priceB - priceA;
            });

            visibleCards.forEach(function (card) {
                vehicleGrid.appendChild(card);
            });
        }
    }

    // Filtre event listener'ları
    if (filterFuel) {
        filterFuel.addEventListener('change', applyFilters);
    }
    if (filterTransmission) {
        filterTransmission.addEventListener('change', applyFilters);
    }
    if (filterSort) {
        filterSort.addEventListener('change', applyFilters);
    }

    // Sıfırla butonu
    if (filterReset) {
        filterReset.addEventListener('click', function () {
            if (filterFuel) filterFuel.value = '';
            if (filterTransmission) filterTransmission.value = '';
            if (filterSort) filterSort.value = '';
            applyFilters();
        });
    }

    /* ---- Depozito Bilgi Modalı ---- */
    var depositModal = document.getElementById('deposit-modal');
    var depositModalClose = document.getElementById('deposit-modal-close');

    document.addEventListener('click', function (e) {
        if (e.target.closest('.deposit-info-btn')) {
            e.preventDefault();
            if (depositModal) {
                depositModal.style.display = 'flex';
            }
        }
    });

    if (depositModalClose) {
        depositModalClose.addEventListener('click', function () {
            depositModal.style.display = 'none';
        });
    }

    if (depositModal) {
        depositModal.addEventListener('click', function (e) {
            if (e.target === depositModal) {
                depositModal.style.display = 'none';
            }
        });
    }

    /* ---- Floating Buttons - Her Zaman Görünür ---- */
    var floatingBtns = document.querySelector('.floating-buttons');
    if (floatingBtns) {
        floatingBtns.style.opacity = '1';
        floatingBtns.style.pointerEvents = 'auto';
    }

});
